const jwt = require('jsonwebtoken')

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
      accessType: 'offline', // Request offline access to get a refresh token
      prompt: 'consent', // Prompt the user to grant permission again, ensuring refresh token is provided
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Refresh Token:', refreshToken); // Log to verify
        const email = profile.emails[0].value;
        const domain = email.split('@')[1];

        if (domain === 'gmail.com') {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Create new user if one does not exist
            user = new User({
              googleId: profile.id,
              email: profile.emails[0].value,
              displayName: profile.displayName,
              profileImage: profile.photos[0].value,
              isAdmin: email === 'arsi.hoxha2223@gmail.com',
              accessToken: accessToken,
              refreshToken: refreshToken,
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

          // ** Generate JWT here ** 
          const tokenPayload = { id: user._id, email: user.email, isAdmin: user.isAdmin };
          const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Adjust expiration as needed

          // Send JWT token as part of the response
          return done(null, { token });
        } else {
          return done(null, false, { message: 'Unauthorized domain' });
        }
      } catch (err) {
        console.error(err);
        return done(err, false);
      }
    }
  )
);
