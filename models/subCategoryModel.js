const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Subcategory name required'],
            trim: true,
            unique: true,
            minLength: [3, 'Subcategory name must be at least 3 characters'],
            maxLength: [23, 'Subcategory name must be at most 23 characters'],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        image: {
            type: String,
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
            required: [true, 'Subcategory must belong to a category'],
        },
    },
    { timestamps: true }

    );

    module.exports = mongoose.model('SubCategory', subCategorySchema);