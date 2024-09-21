const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mongoose = require('mongoose');
const { google } = require('googleapis');
const User = require('./schemas/UserAuth');

require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Middleware
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
const cors = require('cors');
app.use(express.json()); // Make sure this line is present before defining any routes

app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}));

// Passport Configuration
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/google/callback",
  passReqToCallback: true
},
async (request, accessToken, refreshToken, profile, done) => {
  try {
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    const email = profile.emails[0].value;
    const domain = email.split('@')[1];

    if (domain === 'gmail.com') {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          email: email,
          displayName: profile.displayName,
          profileImage: profile.photos[0].value,
          isAdmin: email === 'arsi.hoxha2223@gmail.com',
          accessToken: accessToken,
          refreshToken: refreshToken
        });
        await user.save();
      } else {
        let updated = false;
        if (user.profileImage !== profile.photos[0].value) {
          user.profileImage = profile.photos[0].value;
          updated = true;
        }
        if (user.accessToken !== accessToken) {
          user.accessToken = accessToken;
          updated = true;
        }
        if (refreshToken && user.refreshToken !== refreshToken) {
          user.refreshToken = refreshToken;
          updated = true;
        }

        if (updated) {
          await user.save();
        }
      }
      return done(null, user);
    } else {
      return done(null, false, { message: 'Unauthorized domain' });
    }
  } catch (err) {
    console.error('Error during Google authentication:', err);
    return done(err, false);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Helper function to fetch emails using Gmail API
async function fetchEmails(accessToken) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 100, // Adjust the number of emails fetched
    });

    const messages = res.data.messages || [];

    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });
      return msg.data;
    });

    const emails = await Promise.all(emailPromises);
    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

// Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
  ],
  accessType: 'offline',
  prompt: 'consent'
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dash');
  }
);

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

app.get('/getEmails', isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'http://localhost:8080/auth/google/callback'
    );
    oauth2Client.setCredentials({ refresh_token: user.refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.messages.list({ userId: 'me', q: '' });

    const categorizedEmails = {};

    for (const message of response.data.messages) {
      const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
      const headers = msg.data.payload.headers;

      // Extract sender email address
      const fromHeader = headers.find(header => header.name === 'From');
      const sender = fromHeader ? fromHeader.value : 'Unknown';

      // Normalize sender
      const senderCategory = sender.split('<')[0].trim(); // Use the part before '<' if present

      // Initialize category array if not exists
      if (!categorizedEmails[senderCategory]) {
        categorizedEmails[senderCategory] = [];
      }

      // Push email data into the appropriate category
      categorizedEmails[senderCategory].push({
        id: msg.data.id,
        snippet: msg.data.snippet,
        payload: msg.data.payload
      });
    }

    res.json(categorizedEmails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create List and Fetch Emails
app.post('/createListAndFetchEmails', isLoggedIn, async (req, res) => {
  try {
    const { workspaceName, listName } = req.body;
    const user = req.user;

    if (!workspaceName || !listName) {
      return res.status(400).json({ error: 'Workspace name and list name are required' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'http://localhost:8080/auth/google/callback'
    );
    oauth2Client.setCredentials({ refresh_token: user.refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch emails that match the list name in the "From" header
    const resEmails = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${listName}`,
      maxResults: 100 // Adjust the number of emails fetched
    });

    const messages = resEmails.data.messages || [];
    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });
      return msg.data;
    });

    const emails = await Promise.all(emailPromises);

    // Find the workspace and add the new list
    const workspace = user.workspaces.find(ws => ws.name === workspaceName);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Add new list to the workspace
    workspace.lists.push({ name: listName, items: emails });

    await user.save();

    res.json({ [listName]: emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Profile Image
app.get('/getProfileImage', isLoggedIn, async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.profileImage) {
      return res.status(404).json({ message: 'Profile image not found' });
    }

    res.json({ profileImage: user.profileImage });
  } catch (error) {
    console.error('Error fetching profile image:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Lists and Emails
app.get('/getListsAndEmails', isLoggedIn, async (req, res) => {
  try {
    const user = req.user;

    // Fetch workspaces for the user
    const workspaces = user.workspaces || [];

    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching lists and emails:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete List
app.delete('/deleteList', isLoggedIn, async (req, res) => {
  try {
    const { workspaceName, listName } = req.body;
    const userId = req.user._id;

    if (!userId || !workspaceName || !listName) {
      return res.status(400).json({ error: 'User ID, workspace name, and list name are required' });
    }

    // Find the user and update the workspace by removing the list
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'workspaces.name': workspaceName },
      { $pull: { 'workspaces.$.lists': { name: listName } } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User or workspace or list not found' });
    }

    // Send success response with updated workspaces
    res.status(200).json({ message: 'List removed successfully', workspaces: updatedUser.workspaces });

  } catch (err) {
    console.error('Error deleting list:', err);
    res.status(500).json({ error: 'An error occurred while deleting the list' });
  }
});

// Create New List
app.post('/createNewList', isLoggedIn, async (req, res) => {
  const { workspaceName, listName } = req.body;
  const userId = req.user._id;

  if (!userId || !workspaceName || !listName || !listName.trim()) {
    return res.status(400).json({ error: 'User ID, workspace name, and list name are required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the workspace and add the new list
    const workspace = user.workspaces.find(ws => ws.name === workspaceName);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if the list name already exists in the workspace
    const isListNameExists = workspace.lists.some(list => list.name === listName.trim());

    if (isListNameExists) {
      return res.status(400).json({ error: 'List name already exists' });
    }

    // Add new list to the workspace
    workspace.lists.push({
      name: listName.trim(),
      items: []  // Initialize with an empty items array
    });

    await user.save();

    res.status(201).json({ message: 'New list created successfully', workspaces: user.workspaces });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/workspace', isLoggedIn, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const userId = req.user._id; // Assuming req.user contains the logged-in user's information

    // Validate the inputs
    if (!name || !imageUrl) {
      return res.status(400).json({ message: 'Workspace name and image URL are required.' });
    }

    // Update the user document to include the new workspace
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          workspaces: { name, imageUrl }
        }
      },
      { new: true } // Return the updated user
    );

    res.status(201).json({ message: 'Workspace created successfully', workspace: updatedUser.workspaces[updatedUser.workspaces.length - 1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/workspace', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user contains the logged-in user's information

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/workspaceUser/:name', isLoggedIn, async (req, res) => {
  const { name } = req.params;
  const userId = req.user._id; // Assuming req.user contains the logged-in user's information

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    

    const workspace = user.workspaces.find(workspace => workspace.name === name);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/workspaces', isLoggedIn, async (req, res) => {
  const { name, backgroundImage } = req.body;
  const userId = req.user.id; // Assuming req.user contains user information after authentication

  try {
    // Find the user and add the new workspace to their workspaces array
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new workspace object
    const newWorkspace = {
      name,
      imageUrl: backgroundImage, // Adjusted field name
      createdAt: new Date(),     // Set creation date
      lists: []                  // Initialize with an empty lists array
    };

    // Add the new workspace to the user's workspaces
    user.workspaces.push(newWorkspace);

    // Save the updated user document
    const updatedUser = await user.save();

    res.status(201).json(updatedUser.workspaces[updatedUser.workspaces.length - 1]); // Return the newly created workspace
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});
app.get('/api/workspaces', isLoggedIn, async (req, res) => {
  const userId = req.user.id; // Assuming req.user contains user information after authentication

  try {
    // Find the user by ID and select only the workspaces field
    const user = await User.findById(userId).select('workspaces');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract workspace names and images
    const workspaces = user.workspaces.map(workspace => ({
      name: workspace.name,
      imageUrl: workspace.imageUrl
    }));

    res.status(200).json(workspaces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve workspaces' });
  }
});
app.get('/api/workspaces/:workspaceName', isLoggedIn, async (req, res) => {
  const {  workspaceName } = req.params;
  const userId = req.user.id; // Assuming req.user contains user information after authentication

  try {
    // Find the user by ID
    const user = await User.findById(userId).select('workspaces');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the workspace within the user's workspaces
    const workspace = user.workspaces.find(ws => ws.name === workspaceName);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.status(200).json(workspace);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve workspace' });
  }
});


app.post('/api/workspaces/:workspaceName/:listName', isLoggedIn, async (req, res) => {
  try {
    const { workspaceName, listName } = req.params;
    const user = req.user;

    // Validate input
    if (!workspaceName || !listName) {
      return res.status(400).json({ error: 'Workspace name and list name are required' });
    }

    // Setup OAuth2 client with user's refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'http://localhost:8080/auth/google/callback'
    );
    oauth2Client.setCredentials({ refresh_token: user.refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch emails based on the list name used as the "from" filter
    const resEmails = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${listName}`,
      maxResults: 100 // Fetch a limited number of emails
    });

    const messages = resEmails.data.messages || [];

    // Fetch email details for each message
    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });
      
      // Extract relevant information from the message
      const headers = msg.data.payload.headers;
      const subject = headers.find(header => header.name === 'Subject')?.value || 'No Subject';
      const from = headers.find(header => header.name === 'From')?.value || 'Unknown Sender';
      const body = msg.data.snippet || 'No Body';

      return { subject, from, body }; // Only return the necessary fields
    });

    const emails = await Promise.all(emailPromises);

    // Find the workspace in the user's data
    let workspace = user.workspaces.find(ws => ws.name === workspaceName);

    if (!workspace) {
      // Create the workspace if it doesn't exist
      workspace = { name: workspaceName, lists: [] };
      user.workspaces.push(workspace);
    }

    // Check if the list already exists in the workspace
    let existingList = workspace.lists.find(list => list.name === listName);

    if (!existingList) {
      // Add the new list to the workspace
      existingList = { name: listName };
      workspace.lists.push(existingList);
    }

    // Save the updated user object to the database
    await user.save(); // Assuming you're using something like Mongoose to save the user

    // Respond with the fetched emails
    res.json({ listName, emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/api/workspaces/:workspaceName/emails', isLoggedIn, async (req, res) => {
  try {
    const { workspaceName } = req.params;
    const user = req.user;

    // Find the workspace in the user's data
    const workspace = user.workspaces.find(ws => ws.name === workspaceName);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Setup OAuth2 client with user's refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'http://localhost:8080/auth/google/callback'
    );
    oauth2Client.setCredentials({ refresh_token: user.refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const allEmails = [];

    // Loop through each list in the workspace and fetch the emails
    for (const list of workspace.lists) {
      // Try to fetch emails based on list name either in the sender or the subject
      const resEmails = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${list.name} OR subject:${list.name}`, // Broader matching based on sender or subject
        maxResults: 100
      });

      const messages = resEmails.data.messages || [];

      if (messages.length === 0) {
        console.log(`No emails found for list: ${list.name}`);
        continue; // If no emails found, skip this list
      }

      // Fetch email details for each message in the list
      const emailPromises = messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });

        // Extract relevant information from the message headers
        const headers = msg.data.payload.headers;
        const subject = headers.find(header => header.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(header => header.name === 'From')?.value || 'Unknown Sender';
        const body = msg.data.snippet || 'No Body';

        return {id: message.id, subject, from, body, listName: list.name };
      });

      const emails = await Promise.all(emailPromises);
      allEmails.push(...emails); // Append emails to the master list
    }

    // Respond with all emails from all lists in the workspace
    res.json({ workspaceName, emails: allEmails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.listen(8080, () => {
  console.log('Server started on http://localhost:8080');
});
