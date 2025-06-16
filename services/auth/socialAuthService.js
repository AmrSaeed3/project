const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../../models/userModel');
const { createToken } = require('./tokenService');

// Configure passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Configure Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `https://project-yhx7.onrender.com/api/v1/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user in database
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : undefined
        });
      }

      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }));
} else {
  console.warn('Google OAuth is disabled: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables');
}

// Configure Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.BASE_URL || 'http://localhost:8000'}/api/v1/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user in database
      let user = await User.findOne({ facebookId: profile.id });

      if (!user) {
        user = await User.create({
          facebookId: profile.id,
          name: profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : undefined
        });
      }

      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }));
} else {
  console.warn('Facebook OAuth is disabled: Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET environment variables');
}

// Google OAuth handlers
exports.googleLogin = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: true }, async (err, user, info) => {
    // Check if this is a reused code (common when browser sends multiple requests)
    if (err && err.message && err.message.includes('code was already redeemed')) {
      return res.status(200).json({
        status: 'success',
        message: 'Authentication code already used. Please use the token from the previous response.'
      });
    }
    
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: err.message || 'An error occurred during authentication'
      });
    }
    
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: info && info.message ? info.message : 'Could not authenticate with Google'
      });
    }
    
    // Log the user in
    req.login(user, async (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      
      try {
        // Generate JWT token for the authenticated user
        const token = createToken(user._id);
        
        // Save token to user document in database
        user.authToken = token;
        await user.save({ validateBeforeSave: false });
        
        // Set token as a cookie
        res.cookie('jwt', token, {
          expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        // Return JSON response with token
        return res.status(200).json({
          status: 'success',
          message: 'Successfully authenticated with Google',
          data: {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role
            },
            token
          }
        });
      } catch (error) {
        console.error('Error saving token:', error);
        return res.status(500).json({
          status: 'error',
          message: 'Error saving authentication token'
        });
      }
    });
  })(req, res, next);
};

// Facebook OAuth handlers
exports.facebookLogin = passport.authenticate('facebook', { 
  scope: ['email'] 
});

exports.facebookCallback = (req, res, next) => {
  passport.authenticate('facebook', { session: true }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: err.message || 'An error occurred during authentication'
      });
    }
    
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: info && info.message ? info.message : 'Could not authenticate with Facebook'
      });
    }
    
    // Log the user in
    req.login(user, async (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      
      // Generate JWT token for the authenticated user
      const token = createToken(user._id);
      
      // Save token to user document in database
      user.authToken = token;
      await user.save({ validateBeforeSave: false });
      
      // Set token as a cookie
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Return JSON response with token
      return res.status(200).json({
        status: 'success',
        message: 'Successfully authenticated with Facebook',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    });
  })(req, res, next);
};

// Make sure all functions are exported
module.exports = {
  googleLogin: exports.googleLogin,
  googleCallback: exports.googleCallback,
  facebookLogin: exports.facebookLogin,
  facebookCallback: exports.facebookCallback
};
