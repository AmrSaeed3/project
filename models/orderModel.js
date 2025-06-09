const mongoose = require('mongoose')

const orderSchema = new mongoose.orderSchema(
    {
        user:{
            type : mongoose.Schema.ObjectId,
            ref:'User',
            required:[true,'order must be belong to user'],
        },
        products: [
                    {
                        product: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Product',
                        },
                        quantity: Number,
                            
                        price:  Number,
                    },
        ],
        taxPrice:{
            type: Number,
            default:0,
        },
        shippingAddress: {
            type: String,
            required: [true, 'shipping address is required'],
        },
        shippingPrice: {
            type: Number,
            default:0,
        },
        totalOrderPrice: {
            type: Number,
        },
        PaymentMethodType: {
            type: String,
            enum: ['card','cash'],
            default: 'cash'
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: Date,
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: Date,
    },
    { Timestamp: true }
);

module.exports = mongoose.model('Order', orderSchema);

