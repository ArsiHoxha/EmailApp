const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./schemas/UserAuth');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/google/callback",
  passReqToCallback: true,
  accessType: 'offline', // Request offline access to get a refresh token
  prompt: 'consent',    // Prompt the user to grant permission again, ensuring refresh token is provided
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    // Add any other scopes you need
  ]
},
async (request, accessToken, refreshToken, profile, done) => {
  try {
    console.log('Refresh Token:', refreshToken); // Log to verify
    const email = profile.emails[0].value;
    const domain = email.split('@')[1];

    if (domain === 'gmail.com') {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          profileImage: profile.photos[0].value,
          isAdmin: email === 'arsi.hoxha2223@gmail.com',
          accessToken: accessToken,
          refreshToken: refreshToken // Save the refresh token
        });
        await user.save();
      } else {
        // Update profile image, access token, and refresh token if they have changed
        let updated = false;
        if (user.profileImage !== profile.photos[0].value) {
          user.profileImage = profile.photos[0].value;
          updated = true;
        }
        if (user.accessToken !== accessToken) {
          user.accessToken = accessToken;
          updated = true;
        }
        if (user.refreshToken !== refreshToken) {
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
    console.error(err);
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
