const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const User = require('../../models/userModel');
const slugify = require('slugify');

exports.createUserValidator = [
    check('name')
        .notEmpty()
        .withMessage('User name is required')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long')
        .isLength({ max: 32 })
        .withMessage('Name cannot exceed 32 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must contain only letters and spaces')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),

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
        // .custom((val, { req }) => {
        //     if (val !== req.body.passwordConfirm) {
        //         throw new Error('Password confirmation does not match password');
        //     }
        //     return true;
        // }),

    // check('passwordConfirm')
    //     .notEmpty()
    //     .withMessage('Password confirmation is required')
    //     .custom((val, { req }) => {
    //         if (val !== req.body.password) {
    //             throw new Error('Password confirmation does not match password');
    //         }
    //         return true;
    //     }),

    check('phone')
        .optional()
        .isMobilePhone(['ar-EG'])
        .withMessage('Invalid phone number format, only Egyptian numbers is supported')
        .isLength({ min: 11, max: 13 })
        .withMessage('Phone number must be between 11 and 13 digits'),

    check('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Invalid role, must be either user or admin'),

    validatorMiddleware,
];

exports.getUserValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid user ID format'),
    validatorMiddleware,
];

exports.updateUserValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid user ID format'),

    check('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long')
        .isLength({ max: 32 })
        .withMessage('Name cannot exceed 32 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must contain only letters and spaces')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),

    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address format')
        .custom(async (val, { req }) => {
            const user = await User.findOne({ email: val });
            if (user && user._id.toString() !== req.params.id) {
                throw new Error('Email already in use');
            }
            return true;
        }),

    check('phone')
        .optional()
        .isMobilePhone(['ar-EG'])
        .withMessage('Invalid phone number format, only Egyptian numbers is supported')
        .isLength({ min: 11, max: 13 })
        .withMessage('Phone number must be between 11 and 13 digits'),

    check('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Invalid role, must be either user or admin'),
        
    // Explicitly reject password fields in regular updates
    check('password')
        .not()
        .exists()
        .withMessage('This route is not for password updates. Please use /changePassword/:id'),
        
    // check('passwordConfirm')
    //     .not()
    //     .exists()
    //     .withMessage('This route is not for password updates. Please use /changePassword/:id'),

    validatorMiddleware,
];

exports.toggleUserActiveValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid user ID format'),
    validatorMiddleware,
];

exports.changeUserPasswordValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid user ID format'),

    check('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    check('password')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .isLength({ max: 32 })
        .withMessage('Password cannot exceed 32 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
        .custom(async (val, { req }) => {
            // Ensure new password is different from current password
            if (req.body.currentPassword === val) {
                throw new Error('New password must be different from current password');
            }
            
            return true;
        }),

    validatorMiddleware,
];

// Add a specific validator for the /me route
exports.getMeValidator = [
    // No ID validation needed for /me route
    validatorMiddleware,
];
