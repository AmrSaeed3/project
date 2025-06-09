const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Create a new order with cash payment method
exports.createCashOrder = asyncHandler(async (req, res, next) => {
    //1. Get the cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
        return next(new ApiError('Cart not found', 404));
    }

    //2. get order price depend on cart price && check if coupon is applied
    const cartPrice = cart.totalPriceAfterDiscount
        ? cart.totalPriceAfterDiscount
        : cart.totalPrice;
    const totalOrderPrice = cartPrice + cart.taxPrice + cart.shippingPrice;
    
    //3. create order with default payment method 'cash'
    const order = await Order.create({
        user: req.user.id,
        products: cart.products.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price,
        })),
        paymentMethod: 'cash',
        shippingAddress: cart.shippingAddress,
        totalPrice: totalOrderPrice
    });
    
    //4. After creating order, decrement the product quantity in stock, increment product sold
    if(order){
        const bulkOperations = cart.products.map(item => ({
            updateOne: {
                filter: { _id: item.product },
                update: {
                    $inc: {
                        quantity: -item.quantity,
                        sold: +item.quantity
                    }
                }
            }
        }));
        await Product.bulkWrite(bulkOperations, {});
        
    
    //5. clear the cart depend on cartId
    await Cart.findByIdAndDelete(cart._id);
    }
    res.status(201).json({
        status: 'success',
        data: {
            order
        }
    });
});

// Middleware to filter orders for the logged-in user
exports.filterOrderForLoggedUser = asyncHandler(
    async (req, res, next) => {
        // If the user is an admin or manager, return all orders
        if (req.user.role === 'user') {
            // If the user is a regular user, filter orders by user ID
            req.query.user = req.user.id;
        }
        next();
    }
);

// Get all orders for user and admin and manager
exports.findAllOrders = factory.getAll(Order)

// Get a specific order by ID
exports.findSpecificOrder = factory.getOne(Order);

// Update order to paid
exports.updateOrderToPaid = factory.updateOne(Order, {
    fieldToUpdate: 'isPaid',
    valueToUpdate: true,
    fieldToSet: 'paidAt',
    valueToSet: Date.now()
});

// exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//         return next(new ApiError('Order not found', 404));
//     }
//     order.isPaid = true;
//     order.paidAt = Date.now();
//     await order.save();
//     res.status(200).json({
//         status: 'success',
//         data: {
//             order
//         }
//     });
// });

// Update order to delivered
exports.updateOrderToDelivered = factory.updateOne(Order, {
    fieldToUpdate: 'isDelivered',
    valueToUpdate: true,
    fieldToSet: 'deliveredAt',
    valueToSet: Date.now()
});
// exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//         return next(new ApiError('Order not found', 404));
//    }
//     order.isDelivered = true;
//     order.deliveredAt = Date.now();
//     await order.save();
//     res.status(200).json({
//         status: 'success',
//         data: {
//             order
//         }
//     });
// });

// Create Stripe checkout session
exports.createStripeSession = asyncHandler(async (req, res, next) => {
    //1. Get the cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
        return next(new ApiError('Cart not found', 404));
    }

    //2. get order price depend on cart price && check if coupon is applied
    const cartPrice = cart.totalPriceAfterDiscount
        ? cart.totalPriceAfterDiscount
        : cart.totalPrice;
    const totalOrderPrice = cartPrice + cart.taxPrice + cart.shippingPrice;

    //3. Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                name: req.user.name,
                amount: totalOrderPrice * 100, 
                currency: 'egp',
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/orders`,
        cancel_url: `${process.env.BASE_URL}/cart/${req.params.cartId}`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,

    });

    res.status(200).json({ status: 'success', session });
});

exports.webhookStripe = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
        }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        //1. Get the cart depend on cartId
        const cart = await Cart.findById(session.client_reference_id);
        if (!cart) {
            return next(new ApiError('Cart not found', 404));
        }

        //2. get order price depend on cart price && check if coupon is applied
        const cartPrice = cart.totalPriceAfterDiscount
            ? cart.totalPriceAfterDiscount
            : cart.totalPrice;
        const totalOrderPrice = cartPrice + cart.taxPrice + cart.shippingPrice;

        //3. create order with default payment method 'card'
        const order = await Order.create({
            user: session.metadata.userId,
            products: cart.products.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
            })),
            paymentMethod: 'card',
            shippingAddress: session.metadata.shippingAddress,
            totalPrice: totalOrderPrice,
            isPaid: true,
            paidAt: Date.now()
        });

        //4. After creating order, decrement the product quantity in stock, increment product sold
        if(order){
            const bulkOperations = cart.products.map(item => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: {
                        $inc: {
                            quantity: -item.quantity,
                            sold: +item.quantity
                        }
                    }
                }
            }));
            await Product.bulkWrite(bulkOperations, {});
        
        //5. clear the cart depend on cartId
        await Cart.findByIdAndDelete(cart._id);
        }
    }
    // Return a response to acknowledge receipt of the event
    res.status(200).json({ received: true });
});