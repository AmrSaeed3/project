const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const Review = require('../../models/reviewModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const slugify = require("slugify");

exports.createReviewValidator = [
    check('review')
        .optional()
        .notEmpty()
        .withMessage('Review cannot be empty'),
    check('ratings')
        .optional()
        .notEmpty()
        .withMessage('Ratings cannot be empty')
        .isNumeric()
        .withMessage('Ratings must be a number')
        .isLength({ min: 1 })
        .withMessage('Ratings must be above or equal 1.0')
        .isLength({ max: 5 })
        .withMessage('Ratings must be below or equal 5.0'),
    check('user')
        .notEmpty()
        .withMessage('User cannot be empty')
        .isMongoId()
        .withMessage('Invalid user ID format')
        .custom((val) => {
            return User.findById(val).then((user) => {
                if (!user) {
                    return Promise.reject(
                        new Error(`No user found for this ID: ${val}`)
                    );
                }
            });
        }),
    check('product')
        .notEmpty()
        .withMessage('Product cannot be empty')
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
        })
        .custom((val, { req }) => {
            return Review.findOne({ user: req.user.id, product: val }).then(
                (review) => {
                    if (review) {
                        return Promise.reject(
                            new Error(`You already reviewed this product`)
                        );
                    }
                }
            );
        }),
    validatorMiddleware,
];

exports.getReviewValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid review ID format'),
    validatorMiddleware,
];

exports.updateReviewValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid review ID format')
        .custom((val, { req }) => {
            //chek review ownership before update
            return Review.findById(val).then((review) => {
                if (!review) {
                    return Promise.reject(
                        new Error(`No review found for this ID: ${val}`)
                    );
                }
                if (review.user._id.toString() !== req.user.id) {
                    return Promise.reject(
                        new Error(`You are not allowed to update this review`)
                    );
                }
            })
        }),
    check('review')
        .optional()
        .notEmpty()
        .withMessage('Review cannot be empty'),
    check('ratings')
        .optional()
        .notEmpty()
        .withMessage('Ratings cannot be empty')
        .isNumeric()
        .withMessage('Ratings must be a number')
        .isLength({ min: 1 })
        .withMessage('Ratings must be above or equal 1.0')
        .isLength({ max: 5 })
        .withMessage('Ratings must be below or equal 5.0'),
    validatorMiddleware,
];

exports.deleteReviewValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid review ID format')
        .custom((val, { req }) => {
            //chek review ownership before update
            if (req.user.role !== 'admin') {
                return Review.findById(val).then((review) => {
                    if (!review) {
                        return Promise.reject(
                            new Error(`No review found for this ID: ${val}`)
                        );
                    }
                    if (review.user._id.toString() !== req.user.id) {
                        return Promise.reject(
                            new Error(`You are not allowed to update this review`)
                        );
                    }
                })
            }
            return true;
        }),
    validatorMiddleware,
];
