const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const Product = require('../../models/productModel');

exports.addToWishlistValidator = [
    check('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isMongoId()
        .withMessage('Invalid product ID format')
        .custom((val) => {
            return Product.findById(val).then((product) => {
                if (!product) {
                    return Promise.reject(
                        new Error(`No product found for this ID: ${val}`)
                    );
                }
            });
        }),
    validatorMiddleware,
];

exports.removeFromWishlistValidator = [
    check('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isMongoId()
        .withMessage('Invalid product ID format')
        .custom((val) => {
            return Product.findById(val).then((product) => {
                if (!product) {
                    return Promise.reject(
                        new Error(`No product found for this ID: ${val}`)
                    );
                }
            });
        }),
    validatorMiddleware,
];
