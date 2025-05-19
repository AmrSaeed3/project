const express = require('express');
const {
    createProductValidator,
    updateProductValidator,
    getProductValidator,
    deleteProductValidator
} = require('../utils/validators/productValidator');

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
        uploadProductImages,
        resizeProductImages,
        updateProductValidator,
        updateProductByID
    )
    .delete(deleteProductValidator, deleteProductByID);

module.exports = router;
