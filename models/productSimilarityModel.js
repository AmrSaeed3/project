const mongoose = require('mongoose');

// Define schema for existing ProductSimilarity collection
const productSimilaritySchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true,
            unique: true
        },
        similarProducts: [
            {
                similarProductId: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product'
                },
                similarityScore: {
                    type: Number,
                    min: 0,
                    max: 1
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Create model for existing collection
const ProductSimilarity = mongoose.model('ProductSimilarity', productSimilaritySchema);

module.exports = ProductSimilarity;