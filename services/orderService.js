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
        products: cart.products,
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice,
        totalPriceAfterDiscount: cart.totalPriceAfterDiscount, // <-- add this line
        paymentMethodType: 'cash', // or 'card'
    });

    // 4) After creating order, decrement product quantity, increment product sold
    if (order) {
        const bulkOption = cart.products.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
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

    // 3) Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'egp',
                    product_data: {
                        name: req.user.name,
                    },
                    unit_amount: Math.round(totalOrderPrice * 100), // amount in cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `https://project-yhx7.onrender.com/api/v1/products`, // updated
        cancel_url: `https://project-yhx7.onrender.com/api/v1/cart`,   // updated
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,
    });

    // 4) send session to response
    res.status(200).json({ status: 'success', session });
});

const createCardOrder = async (session) => {
    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata;
    const orderPrice = session.amount_total / 100;

    const cart = await Cart.findById(cartId);
    const user = await User.findOne({ email: session.customer_email });

    if (!cart || !user) return;

    const order = await Order.create({
        user: user._id,
        products: cart.products,
        shippingAddress: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            street: shippingAddress.street,
            country: shippingAddress.country,
            phone: shippingAddress.phone,
        },
        totalOrderPrice: orderPrice,
        totalPriceAfterDiscount: cart.totalPriceAfterDiscount, // <-- add this line
        isPaid: true,
        paidAt: Date.now(),
        PaymentMethodType: 'card', // use correct field name as in your model
    });

    // 4) After creating order, decrement product quantity, increment product sold
    if (order) {
        const bulkOption = cart.products.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
            },
        }));
        await Product.bulkWrite(bulkOption, {});

        // 5) Clear cart depend on cartId
        await Cart.findByIdAndDelete(cartId);
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
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        //  Create order
        await createCardOrder(event.data.object); // Await here
    }

    res.status(200).json({ received: true });
    next();
});
