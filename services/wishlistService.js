const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const ApiError = require('../utils/apiError');

// Add product to wishlist
exports.addToWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user.id, 
        {
        $addToSet: { wishlist: req.params.productId }
        }, 
        {
            new: true
        });

    res.status(200).json({
        status: 'success',
        message: 'Product added to wishlist',
        data: user.wishlist
    });
});

// Remove product from wishlist
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user.id, 
        {
        $pull: { wishlist: req.params.productId }
        }
    , {
        new: true
    });

    res.status(200).json({
        status: 'success',
        message: 'Product removed from wishlist',
        data: user.wishlist
    });
});

// Get user wishlist
exports.getWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate({
        path: 'wishlist',
        select: 'name imageCover price slug ratingsAverage ratingsQuantity description'
    });

    res.status(200).json({
        status: 'success',
        results: user.wishlist.length,
        data: user.wishlist
    });
});
