const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const User = require('../../models/userModel');

exports.signupUserValidator = [
    check('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long')
        .isLength({ max: 32 })
        .withMessage('Name cannot exceed 32 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must contain only letters and spaces'),

    check('email')
        .notEmpty()
        .withMessage('Email address is required')
        .isEmail()
        .withMessage('Invalid email address format')
        .custom(async (val) => {
            const user = await User.findOne({ email: val });
            if (user) {
                throw new Error('Email already in use');
            }
            return true;
        }),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .isLength({ max: 32 })
        .withMessage('Password cannot exceed 32 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    validatorMiddleware,
];

exports.loginUserValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email address is required')
        .isEmail()
        .withMessage('Invalid email address format'),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .isLength({ max: 32 })
        .withMessage('Password cannot exceed 32 characters'),

    validatorMiddleware,
];

exports.forgotPasswordValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email address is required')
        .isEmail()
        .withMessage('Invalid email address format'),

    validatorMiddleware,
];

exports.resetPasswordValidator = [
    check('resetCode')
        .notEmpty()
        .withMessage('Reset code is required')
        .isNumeric()
        .withMessage('Reset code must be a number')
        .isLength({ min: 6, max: 6 })
        .withMessage('Reset code must be 6 digits long'),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .isLength({ max: 32 })
        .withMessage('Password cannot exceed 32 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    validatorMiddleware,
];

exports.verifyResetCodeValidator = [
    check('resetCode')
        .notEmpty()
        .withMessage('Reset code is required')
        .isNumeric()
        .withMessage('Reset code must be a number')
        .isLength({ min: 6, max: 6 })
        .withMessage('Reset code must be 6 digits long'),

    validatorMiddleware,
];


