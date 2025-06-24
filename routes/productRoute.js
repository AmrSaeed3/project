const express = require('express');

const {
    createProductValidator,
    updateProductValidator,
    getProductValidator,
    deleteProductValidator
} = require('../utils/validators/productValidator');

const { protect, allowedTo } = require('../services/auth/index');

const {
    createProduct,
    getProduct,
    getProductByID,
    updateProductByID,
    deleteProductByID,
    uploadProductImages,
    resizeProductImages,
    validateProductImages,
    getSimilarProducts
} = require("../services/productService");

const router = express.Router();

// Middleware to parse sizes field
function parseSizesField(req, res, next) {
    if (typeof req.body.sizes === 'string') {
        try {
            // Try to parse as JSON array
            req.body.sizes = JSON.parse(req.body.sizes);
        } catch {
            // If not JSON, wrap as array
            req.body.sizes = [req.body.sizes];
        }
    }
    next();
}

// /api/v1/products
router.route('/')
    .get(getProduct)
    .post(
        protect,
        allowedTo('admin'),
        uploadProductImages,
        resizeProductImages,
        validateProductImages,
        parseSizesField, // <-- Add this line
        createProductValidator,
        createProduct
    );

// Add this route to your product routes
router.get('/:productId/similar', getSimilarProducts);


// /api/v1/products/:id
router.route('/:id')
    .get(getProductValidator, getProductByID)
    .put(
        protect,
        allowedTo('admin'),
        uploadProductImages,
        resizeProductImages,
        updateProductValidator,
        updateProductByID
    )
    .delete(
        protect,
        allowedTo('admin'),
        deleteProductValidator, deleteProductByID);


module.exports = router;
