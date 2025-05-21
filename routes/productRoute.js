const express = require('express');

const {
    createProductValidator,
    updateProductValidator,
    getProductValidator,
    deleteProductValidator
} = require('../utils/validators/productValidator');

const { protect, allowedTo } = require('../services/auth');

const {
    createProduct,
    getProduct,
    getProductByID,
    updateProductByID,
    deleteProductByID,
    uploadProductImages,
    resizeProductImages,
    validateProductImages
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
