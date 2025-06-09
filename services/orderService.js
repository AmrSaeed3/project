const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');


// Create a new order
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
