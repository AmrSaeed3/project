
const express = require('express');
const passport = require('passport');
const {
    signupUserValidator,
    loginUserValidator,
    forgotPasswordValidator,
    verifyResetCodeValidator,
    resetPasswordValidator
} = require('../utils/validators/authValidator');


const signupUser  = require('../services/auth/signupService')
const loginUser = require('../services/auth/loginService')
const forgotPassword = require('../services/auth/')
const verifyResetCode = require('../services/auth/')
const resetPassword = require('../services/auth/')
const logout = require('../services/auth/')
const googleCallback = require('../services/auth/')
const facebookCallback = require('../services/auth/')


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
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleCallback
);

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    facebookCallback
);

module.exports = router;

