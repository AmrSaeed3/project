const mongoose = require("mongoose");
// const Reviews = require('./reviewModel');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [3, 'too short product name'],
            maxlength: [100, 'too long product name'],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'product description'],
            minlength: [20, 'too short product description'],
        },
        quantity: {
            type: Number,
            required: [true, 'product quantity required'],
            min: [0, 'product quantity must be positive'],
        },
        sold: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'product price required'],
            trim: true,
            max: [100000, 'too long product price'],
        },
        priceAfterDiscount: {
            type: Number,
        },
        colors: {
            type: [String],
            default: [],
        },
        imageCover: {
            type: String,
            required: [true, 'product image cover is required'],
        },
        images: {
            type: [String],
            default: [],
        },
        category: String,
        typecategory: String,
        subcategory1: String,
        subcategory2: String,
        subCategory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
        }],
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
        },
        ratingsAverage: {
            type: Number,
            min: [1, 'rating must be at least 1'],
            max: [5, 'rating must be at most 5'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        sizes: {
            type: [String],
            default: [],
        },
        isWishlisted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Add this to your schema definition
productSchema.index({ name: 'text', description: 'text' });

// Make sure the ref matches exactly the model name used in reviewModel.js
productSchema.virtual('reviews', {
    ref: 'Review', // This should match exactly what's in reviewModel.js
    foreignField: 'product',
    localField: '_id',
}); // Make sure the ref matches exactly the model name used in reviewModel.js


// productSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: "category",
//         select: "name -_id",
//     })
//         .populate({
//             path: "brand",
//             select: "name -_id",
//         })
//         .populate({
//             path: "subCategory",
//             select: "name -_id",
//         });

//     // Don't populate reviews here, we'll do it explicitly in the controller
//     next();
// });

module.exports = mongoose.model("Product", productSchema);
