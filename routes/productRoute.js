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

// /api/v1/products
router.route('/')
    .get(getProduct)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        uploadProductImages,
        resizeProductImages,
        validateProductImages,
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
        allowedTo('admin', 'manager'),
        uploadProductImages,
        resizeProductImages,
        updateProductValidator,
        updateProductByID
    )
    .delete(
        protect,
        allowedTo('admin', 'manager'),
        deleteProductValidator, deleteProductByID);

module.exports = router;
