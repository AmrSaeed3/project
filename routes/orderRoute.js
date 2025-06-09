const express = require('express');


const { protect, allowedTo } = require('../services/auth/index');




module.exports = router;
const express = require('express');
const {
    createCashOrder,
    findAllOrders,
    findSpecificOrder,
    filterOrderForLoggedUser,
    updateOrderToPaid,
    updateOrderToDelivered,
    createStripeSession
} = require('../services/orderService');


const router = express.Router();


router.use(protect);

// Create a new order with cash payment method
router.route('/:cartId').post(allowedTo('user'), createCashOrder);


router.get(
    '/checkout-session/:cartId',
    allowedTo('user'),
    createStripeSession
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