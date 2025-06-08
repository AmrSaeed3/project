const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Cart must belong to a user']
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, 'Cart item must belong to a product']
                },
                quantity: {
                    type: Number,
                    required: [true, 'Cart item quantity required'],
                    min: [1, 'Cart item quantity must be positive'],
                },
            },
        ],
        totalPrice: {
            type: Number,
            default: 0,
        },
        totalItems: {
            type: Number,
            default: 0,
        },
        totalPriceAfterDiscount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Cart', cartSchema);