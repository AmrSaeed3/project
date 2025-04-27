const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'product name required'],
            minlength:[3,'too short product name'],
            maxlength:[100,'too long product name'],
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
            minlength:[20,'too short product description'],
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
            max:[100000,'too long product price'],
        },
        priceAfterDiscount: {
            type: Number,
        },
        imageCover: {
            type: String,
            required: [true, 'product image cover is required'],
        },
        images: {
            type: [String],
            default: [],
        },
        colors: {
            type: [String],
            default: [],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, 'product category required'],
        },
        subCategory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
        },],
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand", // Ensure this matches the name of the Brand model
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
        size: {
            type: String,
            enum: ["XS", "S", "M", "L", "XL", "XXL"],
        },
    },
    {
        timestamps: true,
    }
);
productSchema.pre(/^find/, function (next) {
    
    this.populate({
        path: "category", // First level: Populate the 'category' field
        select: "name -_id", // Select only the 'name' field and exclude '_id'
    })
    .populate({
        path: "brand", // Second level: Populate the 'brand' field
        select: "name -_id", // Select only the 'name' field and exclude '_id'
    })
    .populate({
        path: "subCategory", // Third level: Populate the 'subcategory' field
        select: "name -_id", // Select only the 'name' field and exclude '_id'
    })
    next();
})

module.exports = mongoose.model("Product", productSchema);
