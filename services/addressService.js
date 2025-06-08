
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');

// Add a new address to user profile
exports.addUserAddress = asyncHandler(async (req, res, next) => {
    // Format the address data to match the schema
    const addressData = {
        id: req.body.id || undefined,
        coordinates: {
            type: 'Point',
            coordinates: req.body.coordinates || [0, 0]
        },
        formattedAddress: req.body.formattedAddress,
        placeId: req.body.placeId
    };

    const user = await User.findByIdAndUpdate(
        req.user.id, 
        { address: addressData },
        { new: true }
    );
    
    if (!user) {
        return next(new ApiError('User not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        message: 'Address added successfully',
        data: user.address
    });
});

// Get user address
exports.getUserAddress = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    if (!user) {
        return next(new ApiError('User not found', 404));
    }
    
    if (!user.address) {
        return next(new ApiError('No address found for this user', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: user.address
    });
});

// Update user address
exports.updateUserAddress = asyncHandler(async (req, res, next) => {
    // Format the address data to match the schema
    const addressData = {
        id: req.body.id || undefined,
        coordinates: {
            type: 'Point',
            coordinates: req.body.coordinates || [0, 0]
        },
        formattedAddress: req.body.formattedAddress,
        placeId: req.body.placeId
    };

    const user = await User.findByIdAndUpdate(
        req.user.id, 
        { address: addressData },
        { new: true }
    );
    
    if (!user) {
        return next(new ApiError('User not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        message: 'Address updated successfully',
        data: user.address
    });
});

// Delete user address
exports.deleteUserAddress = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user.id, 
        { $unset: { address: 1 } },
        { new: true }
    );
    
    if (!user) {
        return next(new ApiError('User not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        message: 'Address deleted successfully'
    });
});

