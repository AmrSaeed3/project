const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Coupon = require('../models/couponModel');
const ApiError = require('../utils/apiError');


// Calculate total price
const calculateTotalCartPrice = (cart) => {
    let totalPrice = 0;
    cart.products.forEach((item) => {
        totalPrice += item.price * item.quantity;
    });
    cart.totalPrice = totalPrice;
    return totalPrice;
};

// Add product to cart
exports.addToCart = asyncHandler(async (req, res, next) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            products: [{ product: productId, price: product.price }],
        });
    } else {
        const productIndex = cart.products.findIndex(
            (item) => item.product.toString() === productId
        );

        if (productIndex > -1) {
            const cartItem = cart.products[productIndex];
            cartItem.quantity += 1;
            cart.products[productIndex] = cartItem;
        } else {
            cart.products.push({ product: productId, price: product.price });
        }
    }
    calculateTotalCartPrice(cart);

    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Product added to cart',
        length: cart.products.length,
        data: cart,
    });
});

// Remove product from cart
exports.removeFromCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $pull: { products: { product: req.body.productId } } },
        { new: true }
    );
    calculateTotalCartPrice(cart);

    res.status(200).json({
        status: 'success',
        length: cart.products.length,
        message: 'Product removed from cart',
        data: cart,
    });
});

// Get user cart
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return next(new ApiError(`No cart found for this user`, 404));
    }

    res.status(200).json({
        status: 'success',
        results: cart.products.length,
        data: cart,
    });
});

// Clear cart
exports.clearCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOneAndDelete({ user: req.user.id });

    if (!cart) {
        return next(new ApiError(`No cart found for this user`, 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Cart cleared',
    });
});

// Update cart item quantity
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return next(new ApiError(`No cart found for this user`, 404));
    }

    const productIndex = cart.products.findIndex(
        (item) => item.product.toString() === req.body.productId
    );

    if (productIndex > -1) {
        const cartItem = cart.products[productIndex];
        cartItem.quantity = quantity;
        cart.products[productIndex] = cartItem;
    } else {
        return next(new ApiError(`No product found in cart`, 404));
    }
    calculateTotalCartPrice(cart);

    await cart.save();

    res.status(200).json({
        status: 'success',
        length: cart.products.length,
        message: 'Quantity reduced',
        data: cart,
    });
});


//apply coupon
exports.applyCoupon = asyncHandler(async (req, res, next) => {
    // 1) Get coupon by name
    const coupon = await Coupon.findOne({ name: req.body.coupon, expirationDate: { $gte: Date.now() } });
    if (!coupon) {
        return next(new ApiError(`No coupon found`, 404));
    }

    // 2) Get cart by user id
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new ApiError(`No cart found for this user`, 404));
    }

    const totalPrice = cart.totalPrice;

    // 3) Calculate total price after discount

    const totalPriceAfterDiscount = (
        totalPrice -
        (totalPrice * coupon.discountPercentage) / 100
    ).toFixed(2);

    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Coupon applied',
        data: cart,
    });
});