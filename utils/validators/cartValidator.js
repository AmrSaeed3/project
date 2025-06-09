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
    validatorMiddleware,
];

exports.removeFromCartValidator = [
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
        .custom(async (val) => {
            const coupon = await Coupon.findOne({ name: val });
            if (!coupon) {
                return Promise.reject(
                    new Error(`No coupon found for this name: ${val}`)
                );
                }
            return true;
        }),
    validatorMiddleware,
];

exports.gitLoggedUserCartValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid cart ID format'),
    validatorMiddleware,
];
