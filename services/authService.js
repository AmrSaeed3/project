const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const sendSMS = require('../utils/sendSMS');
const { formatToE164, isValidE164 } = require('../utils/phoneFormatter');
const User = require('../models/userModel');

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
    
    // 6) Send response
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
    let { phone } = req.body;
    
    // 1) Check if phone exists
    if (!phone) {
        return next(new ApiError('Please provide your phone number', 400));
    }
    
    // Format phone to E.164 if it's not already
    if (!isValidE164(phone)) {
        phone = formatToE164(phone);
        if (!isValidE164(phone)) {
            return next(new ApiError('Invalid phone number format. Please provide a valid phone number.', 400));
        }
    }
    
    // 2) Check if user exists with this phone number
    const user = await User.findOne({ phone });
    if (!user) {
        return next(new ApiError('There is no user with this phone number', 404));
    }
    
    // 3) Generate random reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    const hashedResetCode = crypto
        .createHash('sha256')
        .update(resetCode.toString())
        .digest('hex');

    // Save hashed reset code to db
    user.passwordResetToken = hashedResetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    try {
        // In development, we can skip actual SMS sending
        if (process.env.NODE_ENV === 'development' && process.env.SMS_PROVIDER === 'log') {
            console.log('==== DEVELOPMENT MODE: SMS NOT ACTUALLY SENT ====');
            console.log(`Would send SMS to: ${phone}`);
            console.log(`Reset code: ${resetCode}`);
            console.log('===============================================');
            
            res.status(200).json({
                status: 'success',
                message: 'Reset code logged to console (development mode)',
                resetCode: resetCode // Only include in development!
            });
            return;
        }
        
        // In production, send actual SMS
        await sendSMS({
            to: phone,
            message: `Your password reset code is ${resetCode}. This code will expire in 10 minutes.`
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Reset code sent to your phone'
        });
    } catch (err) {
        // If error sending SMS, reset the passwordResetToken and passwordResetExpires
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        return next(new ApiError('Error sending SMS. Please try again later.', 500));
    }
});

// Verify reset code
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
    const { resetCode } = req.body;
    
    // Hash the reset code to compare with the stored hashed token
    const hashedResetCode = crypto
        .createHash('sha256')
        .update(resetCode.toString())
        .digest('hex');
    
    // Find user with matching hashed reset code that hasn't expired
    const user = await User.findOne({
        passwordResetToken: hashedResetCode,
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
    res.clearCookie('token');
    
    // 2) Send response
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    }); 
    
});

// make sure user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
    // 1) Check if token exists, if exists get it
    let token;
    if (req.headers.token) {
        token = req.headers.token.split(' ')[1];
    }
    
    if (!token) {
        return next(new ApiError('You are not logged in. Please login to access this route', 401));
    }
    
    // 2) Verify token (no change happens, expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new ApiError('The user belonging to this token no longer exists', 401));
    }
    
    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter && typeof currentUser.changedPasswordAfter === 'function') {
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new ApiError('User recently changed password! Please login again', 401));
        }
    }
    
    // 5) Grant access to protected route
    req.user = currentUser;
    next();
});

// Authorization (user role)
exports.allowedTo = (...roles) => 
    asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError('You are not allowed to access this route', 403));
        }
        next();
    });

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
