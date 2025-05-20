const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/userModel');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // User exists, return user
          return done(null, user);
        } else {
          // Create new user
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            // Generate a random secure password
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
            image: profile.photos[0].value,
            googleId: profile.id
          });
          
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/v1/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // User exists, return user
          return done(null, user);
        } else {
          // Create new user
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            // Generate a random secure password
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
            image: profile.photos[0].value,
            facebookId: profile.id
          });
          
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;