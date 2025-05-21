const asyncHandler = require('express-async-handler');
const { createToken } = require('./tokenService');

// Google OAuth callback
exports.googleCallback = asyncHandler(async (req, res) => {
    // User is already authenticated by passport
    const token = createToken(req.user._id);

    res.status(200).json({
        status: 'success',
        data: req.user,
        token
    });
});

// Facebook OAuth callback
exports.facebookCallback = asyncHandler(async (req, res) => {
    // User is already authenticated by passport
    const token = createToken(req.user._id);

    res.status(200).json({
        status: 'success',
        data: req.user,
        token
    });
});