
const express = require('express');
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
    logout
} = require('../services/authService');

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

module.exports = router;

