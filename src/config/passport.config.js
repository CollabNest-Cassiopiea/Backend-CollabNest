const OutlookStrategy = require('passport-outlook').Strategy;

// Configure Passport to use Outlook OAuth strategy
const configPassport = (passport) => {
  passport.use(
    new OutlookStrategy(
      {
        clientID: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        callbackURL: '/oauth/outlook/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        // Here, you can save the user to your database or process the profile
        const user = {
          profile,
          accessToken,
        };

        // Return the user object
        return done(null, user);
      }
    )
  );
};

module.exports = configPassport;