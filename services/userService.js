
const asyncHandler = require('express-async-handler');
const factory = require("./handlersFactory");
const User = require("../models/userModel");
const { uploadUserImage, resizeUserImage } = require('../middleware/uploadImageMiddleware');
const ApiError = require('../utils/apiError');
const bcrypt = require('bcryptjs');

// Export the image upload middlewares
exports.uploadUserImage = uploadUserImage;
exports.resizeUserImage = resizeUserImage;

// Create a new user
exports.createUser = factory.createOne(User);

// Get all users
exports.getUser = factory.getAll(User);

// Get a single user by ID
exports.getUserByID = factory.getOne(User);

// Update a user by ID (excluding password fields)
exports.updateUserByID = asyncHandler(async (req, res, next) => {
    // 1) Check if request contains password fields
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new ApiError(
                'This route is not for password updates. Please use /changePassword/:id',
                400
            )
        );
    }
    
    // 2) Filter out unwanted fields that should not be updated
    const filteredBody = filterObj(
        req.body,
        'name',
        'email',
        'phone',
        'role',
        'image'
    );
    
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );
    
    if (!updatedUser) {
        return next(new ApiError(`No user found with this id: ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});

// Helper function to filter object fields
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

// Toggle user active status (instead of deleting)
exports.toggleUserActiveStatus = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return next(new ApiError(`No user found with this id: ${req.params.id}`, 404));
    }
    
    // Toggle the active status
    user.active = !user.active;
    
    // If deactivating, add a timestamp
    if (!user.active) {
        user.deactivatedAt = Date.now();
    } else {
        // If reactivating, remove the timestamp
        user.deactivatedAt = undefined;
    }
    
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
        status: 'success',
        message: `User ${user.active ? 'activated' : 'deactivated'} successfully`,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            active: user.active
        }
    });
});

// Change user password
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
    // 1) Get user by id with password field (which is normally excluded)
    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
        return next(new ApiError(`No user found with this id: ${req.params.id}`, 404));
    }
    
    // 2) Check if current password is correct
    if (!user.password) {
        return next(new ApiError('User has no password set', 400));
    }
    
    const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
    );
    
    if (!isCorrectPassword) {
        return next(new ApiError('Current password is incorrect', 401));
    }
    
    // 3) Check if new password is different from current password
    if (req.body.currentPassword === req.body.password) {
        return next(new ApiError('New password must be different from current password', 400));
    }
    
    // 4) Update password and set passwordChangedAt to current time
    user.password = req.body.password;
    user.passwordChangedAt = Date.now();
    
    // 5) Save user (this will trigger the pre-save middleware to hash the password)
    await user.save();
    
    // 6) Send response
    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
});
