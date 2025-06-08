const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../../models/userModel');
const ApiError = require('../../utils/apiError');
const sendSms = require('../../utils/sendSms');
const { createToken } = require('./tokenService');

// Send OTP to phone
exports.sendPhoneOtp = asyncHandler(async (req, res, next) => {
    const { phone } = req.body;

    if (!phone) {
        return next(new ApiError('Please provide your phone number', 400));
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
        return next(new ApiError('No user found with this phone number', 404));
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');

    user.phoneOtpToken = hashedOtp;
    user.phoneOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.isPhoneOtpVerified = false;
    await user.save({ validateBeforeSave: false });

    // Send OTP via SMS
    try {
        await sendSms(
            user.phone,
            `Your verification code is: ${otp}. It will expire in 10 minutes.`
        );
    } catch (error) {
        user.phoneOtpToken = undefined;
        user.phoneOtpExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ApiError('Failed to send OTP SMS. Try again later!', 500));
    }

    res.status(200).json({
        status: 'success',
        message: 'OTP sent to your phone'
    });
});

// Verify OTP
exports.verifyPhoneOtp = asyncHandler(async (req, res, next) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return next(new ApiError('Phone and OTP are required', 400));
    }

    const hashedOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');

    const user = await User.findOne({
        phone,
        phoneOtpToken: hashedOtp,
        phoneOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ApiError('Invalid or expired OTP', 400));
    }

    user.isPhoneOtpVerified = true;
    user.phoneOtpToken = undefined;
    user.phoneOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Phone number verified successfully'
    });
});
