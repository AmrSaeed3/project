// Export all auth services from this index file
const signupService = require('./signupService');
const loginService = require('./loginService');
const passwordService = require('./passwordService');
const protectService = require('./protectService');
const socialAuthService = require('./socialAuthService');
const logoutService = require('./logoutService');
const tokenService = require('./tokenService');

// Check if all required functions exist in socialAuthService
const googleLogin = socialAuthService.googleLogin || ((req, res) => {
    res.status(501).send('Google login not implemented');
});

const googleCallback = socialAuthService.googleCallback || ((req, res) => {
    res.status(501).send('Google callback not implemented');
});

const facebookLogin = socialAuthService.facebookLogin || ((req, res) => {
    res.status(501).send('Facebook login not implemented');
});

const facebookCallback = socialAuthService.facebookCallback || ((req, res) => {
    res.status(501).send('Facebook callback not implemented');
});

module.exports = {
    // User registration
    signupUser: signupService.signupUser,
    
    // User login
    loginUser: loginService.loginUser,
    
    // Password management
    forgotPassword: passwordService.forgotPassword,
    verifyResetCode: passwordService.verifyResetCode,
    resetPassword: passwordService.resetPassword,
    
    // Authentication middleware
    protect: protectService.protect,
    allowedTo: protectService.allowedTo,
    
    // Social authentication
    googleLogin,
    googleCallback,
    facebookLogin,
    facebookCallback,
    
    // Logout
    logout: logoutService.logout,
    
    // Token utility
    createToken: tokenService.createToken
};
