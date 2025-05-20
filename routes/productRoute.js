const express = require('express');

const {
    createProductValidator,
    updateProductValidator,
    getProductValidator,
    deleteProductValidator
} = require('../utils/validators/productValidator');

const authorization = require('../services/authService');

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
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
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
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
        uploadProductImages,
        resizeProductImages,
        updateProductValidator,
        updateProductByID
    )
    .delete(
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
        deleteProductValidator, deleteProductByID);

module.exports = router;
