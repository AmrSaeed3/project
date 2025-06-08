const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Coupon name required'],
            trim: true,
            unique: true,
            minLength: [3, 'Coupon name must be at least 3 characters'],
            maxLength: [23, 'Coupon name must be at most 23 characters'],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        discountPercentage: {
            type: Number,
            required: [true, 'Discount percentage required'],
            min: [0, 'Discount percentage must be positive'],
            max: [100, 'Discount percentage must be below or equal 100'],
        },
        expirationDate: {
            type: Date,
            required: [true, 'Expiration date required'],
        },

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Coupon', couponSchema);