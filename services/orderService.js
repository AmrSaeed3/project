const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');


exports.createCashOrder = asyncHandler(async (req, res, next) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;

    // 1) Get cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
        return next(
            new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
        );
    }

    // 2) Get order price depend on cart price "Check if coupon apply"
    const cartPrice = cart.totalPriceAfterDiscount
        ? cart.totalPriceAfterDiscount
        : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // 3) Create order with default paymentMethodType cash
    const order = await Order.create({
        user: req.user._id,
        products: cart.products, // This now includes size information
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice,
        totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
        paymentMethodType: 'cash',
    });

    // 4) After creating order,  increment product sold
    if (order) {
        const bulkOption = cart.products.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: {  sold: +item.quantity } },
            },
        }));
        await Product.bulkWrite(bulkOption, {});

        // 5) Clear cart depend on cartId
        await Cart.findByIdAndDelete(req.params.cartId);
    }

    res.status(201).json({ status: 'success', data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'user') req.filterObj = { user: req.user._id };
    next();
});

exports.findAllOrders = factory.getAll(Order);

exports.findSpecificOrder = factory.getOne(Order);

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
    // check if order exist
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(
            new ApiError(
                `There is no such a order with this id:${req.params.id}`,
                404
            )
        );
    }
    // update order to paid
    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json(
        {
            status: 'success',
            data: updatedOrder
        });
});


exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(
            new ApiError(
                `There is no such a order with this id:${req.params.id}`,
                404
            )
        );
    }

    // update order to paid
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json({ status: 'success', data: updatedOrder });
});


exports.checkoutSession = asyncHandler(async (req, res, next) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;

    // Validate shipping address
    if (!req.body.shippingAddress || 
        !req.body.shippingAddress.address || 
        !req.body.shippingAddress.city || 
        !req.body.shippingAddress.country || 
        !req.body.shippingAddress.phone) {
        return next(
            new ApiError('Shipping address is required with complete details', 400)
        );
    }

    // 1) Get cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
        return next(
            new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
        );
    }

    // 2) Get order price depend on cart price "Check if coupon apply"
    const cartPrice = cart.totalPriceAfterDiscount
        ? cart.totalPriceAfterDiscount
        : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // Log the shipping address being sent to Stripe
    console.log('Sending shipping address to Stripe:', req.body.shippingAddress);

    // 3) Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'egp',
                    product_data: {
                        name: req.user.name,
                        description: `Order for ${req.user.name}`,
                    },
                    unit_amount: Math.round(totalOrderPrice * 100), // amount in cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'https://project-yhx7.onrender.com'}/orders/success`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://project-yhx7.onrender.com'}/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: {
            address: req.body.shippingAddress.address,
            city: req.body.shippingAddress.city,
            state: req.body.shippingAddress.state || '',
            street: req.body.shippingAddress.street || '',
            country: req.body.shippingAddress.country,
            phone: req.body.shippingAddress.phone,
        },
    });

    // 4) send session to response
    res.status(200).json({ status: 'success', session });
});

const createCardOrder = async (session) => {
    try {
        console.log('Creating order from session:', session.id);
        
        const cartId = session.client_reference_id;
        const shippingAddress = session.metadata;
        const orderPrice = session.amount_total / 100;

        console.log('Cart ID:', cartId);
        console.log('Shipping Address:', JSON.stringify(shippingAddress));
        console.log('Order Price:', orderPrice);

        // Find the cart
        const cart = await Cart.findById(cartId);
        if (!cart) {
            console.error(`Cart not found with ID: ${cartId}`);
            return null;
        }
        console.log('Cart found:', cart._id);
        console.log('Cart products:', JSON.stringify(cart.products));

        // Find the user
        const user = await User.findOne({ email: session.customer_email });
        if (!user) {
            console.error(`User not found with email: ${session.customer_email}`);
            return null;
        }
        console.log('User found:', user._id);

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.address) {
            console.error('Invalid shipping address in session metadata');
            console.log('Session metadata:', JSON.stringify(session.metadata));
            return null;
        }

        // Create the order
        console.log('Creating order with data:', {
            user: user._id,
            productsCount: cart.products.length,
            shippingAddress: {
                address: shippingAddress.address || '',
                city: shippingAddress.city || '',
                state: shippingAddress.state || '',
                street: shippingAddress.street || '',
                country: shippingAddress.country || '',
                phone: shippingAddress.phone || '',
            },
            totalOrderPrice: orderPrice,
            totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
        });
        
        const order = await Order.create({
            user: user._id,
            products: cart.products, // This now includes size information
            shippingAddress: {
                address: shippingAddress.address || '',
                city: shippingAddress.city || '',
                state: shippingAddress.state || '',
                street: shippingAddress.street || '',
                country: shippingAddress.country || '',
                phone: shippingAddress.phone || '',
            },
            totalOrderPrice: orderPrice,
            totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
            isPaid: true,
            paidAt: Date.now(),
            paymentMethodType: 'card',
        });

        console.log('Order created:', order._id);

        // Update product quantities and sales
        if (order) {
            const bulkOption = cart.products.map((item) => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: { $inc: {sold: +item.quantity} },
                },
            }));
            await Product.bulkWrite(bulkOption, {});
            console.log('Product quantities updated');

            // Clear cart
            await Cart.findByIdAndDelete(cartId);
            console.log('Cart cleared');
        }

        return order;
    } catch (error) {
        console.error('Error in createCardOrder:', error);
        console.error(error.stack);
        throw error;
    }
};

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log the event type for debugging
    console.log('Received Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
        console.log('Processing checkout.session.completed event');
        try {
            // Create order
            const session = event.data.object;
            await createCardOrder(session);
            console.log('Order created successfully');
        } catch (error) {
            console.error('Error creating order from webhook:', error);
            // Don't return an error response here, as Stripe will retry the webhook
            // Just log the error and continue
        }
    }

    // Always return a 200 response to acknowledge receipt of the webhook
    res.status(200).json({ received: true });
    
});
