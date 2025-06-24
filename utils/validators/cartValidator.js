const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const Product = require('../../models/productModel');
const Coupon = require('../../models/couponModel');

exports.addToCartValidator = [
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
    check('size')
        .optional() // Make size optional
        .custom((val, { req }) => {
            return Product.findById(req.body.productId).then((product) => {
                if (!product) {
                    return Promise.reject(
                        new Error(`No product found for this ID: ${req.body.productId}`)
                    );
                }
                // Only validate size if the product has sizes and a size was provided
                if (val && product.sizes && product.sizes.length > 0 && !product.sizes.includes(val)) {
                    return Promise.reject(
                        new Error(`Size ${val} is not available for this product`)
                    );
                }
                return true;
            });
        }),
    validatorMiddleware,
];

exports.removeFromCartValidator = [
    check('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isMongoId()
        .withMessage('Invalid product ID format'),
    check('size')
        .optional(), // Make size optional
    validatorMiddleware,
];

exports.updateCartItemQuantityValidator = [
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
    check('size')
        .optional(), // Make size optional
    check('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isNumeric()
        .withMessage('Quantity must be a number')
        .isLength({ min: 1 })
        .withMessage('Quantity must be positive'),
    validatorMiddleware,
];

exports.applyCouponValidator = [
    check('coupon')
        .notEmpty()
        .withMessage('Coupon is required')
        .isString()
        .withMessage('Coupon must be a string'),

    validatorMiddleware,
];

