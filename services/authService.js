const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// signup user
exports.signupUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;
    
    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new ApiError('Please provide email and password!', 400));
    }
    
    // 2) Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ApiError('User already exists!', 400));
    }
    
    // 3) Create new user
    const user = await User.create({
        name,
        email,
        password,
    });
    // 4) Create token
    const token = createToken(user._id);
    
    // 5) Send response
    res.status(201).json({
        status: 'success',
        data: user,
        token
    });
    
});

// Login user
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    
    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new ApiError('Please provide email and password!', 400));
    }
    
    // 2) Check if user exists
    const userExists = await User.findOne({ email }).select('+password');
    if (!userExists) {
        return next(new ApiError('Invalid email or password', 401));
    }
    
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, userExists.password);
    if (!isPasswordCorrect) {
        return next(new ApiError('Invalid email or password', 401));
    }
    
    // 3) Create token
    const token = createToken(userExists._id);
    
    // 4) Send response
    res.status(200).json({
        status: 'success',
        data: userExists,
        token
    });
    
});

// Forgot password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    
    // 1) Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ApiError('There is no user with this email address', 404));
    }
    
    // 2) Generate random reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    
    // 3) Save reset code and expiration time to user document
    user.passwordResetToken = resetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });
    
    // 4) Send response
    res.status(200).json({
        status: 'success',
        message: 'Reset code sent to email',
        resetCode
    });
    
});

// Verify reset code
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
    const { resetCode } = req.body;
    
    // 1) Check if reset code exists and is not expired
    const user = await User.findOne({
        passwordResetToken: resetCode,
        passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        return next(new ApiError('Invalid or expired reset code', 400));
    }
    
    // 2) Send response
    res.status(200).json({
        status: 'success',
        message: 'Reset code is valid'
    });
    
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { resetCode, password } = req.body;
    
    // 1) Check if reset code exists and is not expired
    const user = await User.findOne({
        passwordResetToken: resetCode,
        passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        return next(new ApiError('Invalid or expired reset code', 400));
    }
    
    // 2) Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // 3) Send response
    res.status(200).json({
        status: 'success',
        message: 'Password reset successfully'
    });
    
});

// Logout user
exports.logout = asyncHandler(async (req, res, next) => {
    // 1) Clear token from client
    res.clearCookie('jwt');
    

    // 2) Send response
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
    
});
