const authorization = require('../services/auth/index');
const {
    addToWishlistValidator,
    removeFromWishlistValidator,
} = require('../utils/validators/wishlistValidator');
const {
    addToWishlist,
    removeFromWishlist,
    getWishlist
} = require('../services/wishlistService');

const express = require('express');
const router = express.Router();

// /api/wishlist
router.route('/')
    .get(authorization.protect, getWishlist);

    // /api/wishlist/:productId
    router.route('/:productId')
    .post(
        authorization.protect,
        addToWishlistValidator,
        addToWishlist
    )
    .delete(
        authorization.protect,
        removeFromWishlistValidator,
        removeFromWishlist
    );

module.exports = router;
