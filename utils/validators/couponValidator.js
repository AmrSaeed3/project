const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const Coupon = require('../../models/couponModel');

exports.createCouponValidator = [
    check('name')
        .notEmpty()
        .withMessage('Coupon name is required')
        .isLength({ min: 3 })
        .withMessage('Coupon name must be at least 3 characters long')
        .isLength({ max: 23 })

        .withMessage('Coupon name cannot exceed 23 characters')
        .custom(async (val, { req }) => {
            const coupon = await Coupon.findOne({ name: val });
            if (coupon) {
                throw new Error('Coupon name already exists');
            }
            return true;
        }),
    check('discountPercentage')
        .notEmpty()
        .withMessage('Discount percentage is required')
        .isNumeric()
        .withMessage('Discount percentage must be a number')
        .isLength({ min: 0 })
        .withMessage('Discount percentage must be positive')
        .isLength({ max: 100 })
        .withMessage('Discount percentage must be below or equal 100'),
    check('expirationDate')
        .notEmpty()
        .withMessage('Expiration date is required')
        .isDate()
        .withMessage('Expiration date must be a valid date'),
    validatorMiddleware,
];

exports.updateCouponValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid coupon ID format'),
    check('name')
        .optional()
        .notEmpty()
        .withMessage('Coupon name is required')
        .isLength({ min: 3 })
        .withMessage('Coupon name must be at least 3 characters long')
        .isLength({ max: 23 })
        .withMessage('Coupon name cannot exceed 23 characters')
        .custom(async (val, { req }) => {
            const coupon = await Coupon.findOne({ name: val });
            if (coupon && coupon._id.toString() !== req.params.id) {
                throw new Error('Coupon name already exists');
            }
            return true;
        }),
    check('discountPercentage')
        .optional()
        .notEmpty()
        .withMessage('Discount percentage is required')
        .isNumeric()
        .withMessage('Discount percentage must be a number')
        .isLength({ min: 0 })
        .withMessage('Discount percentage must be positive')
        .isLength({ max: 100 })
        .withMessage('Discount percentage must be below or equal 100'),
    check('expirationDate')
        .optional()
        .notEmpty()
        .withMessage('Expiration date is required')
        .isDate()
        .withMessage('Expiration date must be a valid date'),
    validatorMiddleware,
];

exports.getCouponValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid coupon ID format'),
    validatorMiddleware,
];

exports.deleteCouponValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid coupon ID format'),
    validatorMiddleware,
];
