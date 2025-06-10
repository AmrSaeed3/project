const express = require('express');
const { protect } = require('../services/auth/index');
const {
    addToCartValidator,
    removeFromCartValidator,
    updateCartItemQuantityValidator,
    applyCouponValidator,
    gitLoggedUserCartValidator,
} = require('../utils/validators/cartValidator');

const {
    addToCart,
    removeFromCart,
    getLoggedUserCart,
    clearCart,
    updateCartItemQuantity,
    applyCoupon,
} = require('../services/cartService');

const router = express.Router();

// /api/cart
router.route('/')
    .get(protect, gitLoggedUserCartValidator, getLoggedUserCart)
    .delete(protect, clearCart);

// /api/cart/add
router.route('/add')
    .post(protect, addToCartValidator, addToCart);

// /api/cart/remove
router.route('/remove')
    .delete(protect, removeFromCartValidator, removeFromCart);

// /api/cart/update
router.route('/update')
    .put(protect, updateCartItemQuantityValidator, updateCartItemQuantity);

// /api/cart/apply-coupon
router.route('/apply-coupon')
    .post(protect, applyCouponValidator, applyCoupon);

module.exports = router;

