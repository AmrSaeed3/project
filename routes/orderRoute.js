const express = require('express');


const { protect, allowedTo } = require('../services/auth/index');


const {
    createCashOrder,
    checkoutSession,
    findAllOrders,
    findSpecificOrder,
    updateOrderToPaid,
    updateOrderToDelivered,
    filterOrderForLoggedUser,
} = require('../services/orderService');


const router = express.Router();


router.use(protect);

// Create a new order with cash payment method
router.route('/:cartId').post(allowedTo('user'), createCashOrder);


router.post(
    '/checkout-session/:cartId',
    allowedTo('user'),
    checkoutSession
);

// Get all orders for the logged-in user or all orders for admin/manager
router.get(
    '/',
    allowedTo('user', 'admin', 'manager'),
    filterOrderForLoggedUser,
    findAllOrders
);
router.get(
    '/:id',
    allowedTo('user', 'admin', 'manager'),
    filterOrderForLoggedUser,
    findSpecificOrder);

// Update order status to paid 
router.put(
    '/:id/pay',
    allowedTo('admin', 'manager'),
    updateOrderToPaid
);

// Update order status to delivered
router.put(
    '/:id/deliver',
    allowedTo('admin', 'manager'),
    updateOrderToDelivered
);

module.exports = router;
