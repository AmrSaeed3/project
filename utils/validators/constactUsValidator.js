const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');

exports.sendEmailValidator = [
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
        .withMessage('Invalid email address format'),

    check('message')
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 10 })
        .withMessage('Message must be at least 10 characters long')
        .isLength({ max: 500 })
        .withMessage('Message cannot exceed 500 characters'),

    validatorMiddleware,
];

