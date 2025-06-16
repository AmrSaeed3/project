
const express = require('express');
const passport = require('passport');
const {
    signupUserValidator,
    loginUserValidator,
    forgotPasswordValidator,
    verifyResetCodeValidator,
    resetPasswordValidator
} = require('../utils/validators/authValidator');

const { 
    signupUser,
    loginUser,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    logout,
    googleLogin,
    googleCallback,
    facebookLogin,
    facebookCallback
} = require('../services/auth/index');
const { createToken } = require('../services/auth/tokenService');
const User = require('../models/userModel');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

// Authentication routes
router.post('/signup', signupUserValidator, signupUser);
router.post('/login', loginUserValidator, loginUser);

// Password management
router.post('/forgotPassword', forgotPasswordValidator, forgotPassword);
router.post('/verifyResetCode', verifyResetCodeValidator, verifyResetCode);
router.put('/resetPassword', resetPasswordValidator, resetPassword);

// Logout
router.get('/logout', logout);

// Google OAuth routes
router.post('/google', googleLogin);
// router.get('/google/callback', googleCallback);
router.post('/google/callback', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Missing Google credential'
            });
        }

        // 1. التحقق من صحة الـ credential
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        
        // 2. البحث عن المستخدم أو إنشائه
        let user = await User.findOne({ email: payload.email });
        
        if (!user) {
            user = await User.create({
                name: payload.name,
                email: payload.email,
                isVerified: true
            });
        }

        // 3. إنشاء token
        const token = createToken(user._id);
        
        // 4. إرسال الرد
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
});
// Facebook OAuth routes
// Check if facebookLogin is defined before using it
router.get('/facebook', facebookLogin || ((req, res) => {
    res.status(501).send('Facebook login not implemented');
}));

// Check if facebookCallback is defined before using it
router.get('/facebook/callback', facebookCallback || ((req, res) => {
    res.status(501).send('Facebook callback not implemented');
}));

// Check if token is saved in user document
router.get('/verify-token-saved', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || 
                req.headers.token?.split(' ')[1] || 
                req.cookies?.jwt;
    
    if (!token) {
      return res.status(400).json({
        status: 'fail',
        message: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with this ID and check if token is saved
    const user = await User.findById(decoded.id).select('+authToken');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        tokenSaved: user.authToken === token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;

