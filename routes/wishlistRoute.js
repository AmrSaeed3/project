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

const { protect, allowedTo } = require('../services/auth/index');

const express = require('express');
const router = express.Router();

// /api/wishlist
router.route('/')
    .get(protect,allowedTo('user'), getWishlist);

// /api/wishlist/:productId
router.route('/:productId')
    .post(
        protect,
        allowedTo('user'),
        addToWishlistValidator,
        addToWishlist
    )
    .delete(
        protect,
        allowedTo('user'),
        removeFromWishlistValidator,
        removeFromWishlist
    );

module.exports = router;
