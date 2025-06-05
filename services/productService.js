const asyncHandler = require('express-async-handler');
const Product = require("../models/productModel");
const factory = require("./handlersFactory");
const { uploadProductImages, resizeProductImages } = require('../middleware/uploadImageMiddleware');
const ApiError = require('../utils/apiError');
const ProductSimilarity = require('../models/productSimilarityModel');

// Export the image upload middlewares
exports.uploadProductImages = uploadProductImages;
exports.resizeProductImages = resizeProductImages;

// Middleware to validate presence of required images
exports.validateProductImages = (req, res, next) => {
    // For create operations, require imageCover
    if (req.method === 'POST' && (!req.files || !req.files.imageCover)) {
        return res.status(400).json({
            status: 'error',
            message: 'Product cover image is required'
        });
    }
    next();
};

// Create a new product
exports.createProduct = factory.createOne(Product);

// Get all products
exports.getProduct = factory.getAll(Product, 'product');

// Get a single product by ID, explicitly populate reviews virtual
exports.getProductByID = factory.getOne(Product, [
    { path: 'reviews', select: 'review ratings user createdAt' }
]);

// Update a product by ID
exports.updateProductByID = factory.updateOne(Product);

// Delete a product by ID
exports.deleteProductByID = factory.deleteOne(Product);

// Get similar products for a specific product
exports.getSimilarProducts = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ApiError(`No product found with ID: ${productId}`, 404));
    }
    
    // Find similar products from the ProductSimilarity collection
    const similarityData = await ProductSimilarity.findOne({ productId });
    
    if (!similarityData || !similarityData.similarProducts || similarityData.similarProducts.length === 0) {
        return res.status(200).json({
            status: 'success',
            results: 0,
            data: []
        });
    }
    
    // Get the number of similar products to return (default to 5)
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    // Get top similar products with their IDs and scores
    const topSimilarProducts = similarityData.similarProducts
        .slice(0, limit)
        .map(item => ({
            similarProductId: item.similarProductId,
            similarityScore: item.similarityScore
        }));
    
    // Extract just the IDs for the query
    const productIds = topSimilarProducts.map(item => item.similarProductId);
    
    // Fetch the actual product data
    const similarProductsData = await Product.find(
        { _id: { $in: productIds } },
        'name imageCover price slug ratingsAverage ratingsQuantity description'
    );
    
    // Create a map for quick lookup
    const productMap = {};
    similarProductsData.forEach(product => {
        productMap[product._id.toString()] = product;
    });
    
    // Combine similarity scores with product data
    const result = topSimilarProducts.map(item => ({
        product: productMap[item.similarProductId.toString()],
        similarityScore: item.similarityScore
    }));
    
    res.status(200).json({
        status: 'success',
        results: result.length,
        data: result
    });
});


