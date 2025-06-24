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
    const { productId, size } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ApiError(`No product found for this ID: ${productId}`, 404));
    }

    // Validate that the size exists for this product if it has sizes
    if (size && product.sizes && product.sizes.length > 0 && !product.sizes.includes(size)) {
        return next(new ApiError(`Size ${size} is not available for this product`, 400));
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            products: [{ 
                product: productId, 
                size: size || null, // Use null if no size provided
                price: product.price 
            }],
        });
    } else {
        // Find if the same product with the same size already exists in cart
        const productIndex = cart.products.findIndex(
            (item) => {
                if (size) {
                    // If size is provided, match product and size
                    return item.product.toString() === productId && item.size === size;
                } else {
                    // If no size provided, match product and ensure item has no size
                    return item.product.toString() === productId && !item.size;
                }
            }
        );

        if (productIndex > -1) {
            // If product with same size exists, increase quantity
            const cartItem = cart.products[productIndex];
            cartItem.quantity += 1;
            cart.products[productIndex] = cartItem;
        } else {
            // If product with this size doesn't exist, add new item
            cart.products.push({ 
                product: productId, 
                size: size || null, // Use null if no size provided
                price: product.price 
            });
        }
    }
    calculateTotalCartPrice(cart);
    cart.totalPriceAfterDiscount = cart.totalPrice;

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
    const { productId, size } = req.body;
    
    // Create a filter based on whether size is provided
    const filter = { user: req.user.id };
    const pullCondition = { product: productId };
    
    if (size) {
        pullCondition.size = size;
    } else {
        pullCondition.size = { $exists: false };
    }
    
    const cart = await Cart.findOneAndUpdate(
        filter,
        { $pull: { products: pullCondition } },
        { new: true }
    );
    
    if (!cart) {
        return next(new ApiError(`No cart found for this user`, 404));
    }
    
    calculateTotalCartPrice(cart);
    cart.totalPriceAfterDiscount = cart.totalPrice;

    await cart.save();

    res.status(200).json({
        status: 'success',
        length: cart.products.length,
        message: 'Product removed from cart',
        data: cart,
    });
});

// Get user cart
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id })
        .populate({
            path: 'products.product',
            select: 'imageCover name price id sizes'
        });

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
    const { productId, size, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return next(new ApiError(`No cart found for this user`, 404));
    }

    // Find the product in the cart
    const productIndex = cart.products.findIndex(
        (item) => {
            if (size) {
                // If size is provided, match product and size
                return item.product.toString() === productId && item.size === size;
            } else {
                // If no size provided, match product and ensure item has no size
                return item.product.toString() === productId && !item.size;
            }
        }
    );

    if (productIndex > -1) {
        const cartItem = cart.products[productIndex];
        cartItem.quantity = quantity;
        cart.products[productIndex] = cartItem;
    } else {
        return next(new ApiError(`Product not found in cart`, 404));
    }
    
    calculateTotalCartPrice(cart);
    cart.totalPriceAfterDiscount = cart.totalPrice;

    await cart.save();

    res.status(200).json({
        status: 'success',
        length: cart.products.length,
        message: 'Quantity updated',
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
