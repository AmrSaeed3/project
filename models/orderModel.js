const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'order must be belong to user'],
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: Number,
                price: Number,
            },
        ],
        taxPrice: {
            type: Number,
            default: 0,
        },
        shippingAddress: {
            address: {
                type: String,
                required: [true, 'shipping address details are required'],
            },
            city: {
                type: String,
                required: [true, 'city is required'],
            },
            state: {
                type: String,
                required: [true, 'state is required'],
            },
            street: {
                type: String,
                required: [true, 'street is required'],
            },
            country: {
                type: String,
                required: [true, 'country is required'],
            },
            phone: {
                type: String,
                required: [true, 'phone number is required'],
            },
        },

        shippingPrice: {
            type: Number,
            default: 0,
        },
        totalOrderPrice: {
            type: Number,
        },
        totalPriceAfterDiscount: {
            type: Number,
        },
        PaymentMethodType: {
            type: String,
            enum: ['card', 'cash'],
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

orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name email phone'
    }).populate({
        path: 'products.product',
        select: 'name imageCover price'
    });
    next();
});

module.exports = mongoose.model('Order', orderSchema);

