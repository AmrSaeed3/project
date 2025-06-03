const asyncHandler = require('express-async-handler');
const Product = require("../models/productModel");
const factory = require("./handlersFactory");
const { uploadProductImages, resizeProductImages } = require('../middleware/uploadImageMiddleware');

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
