const {check} = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');


exports.createSubCategoryValidator = [
    check('name')
        .notEmpty()
        .withMessage('category name required')
        .isLength({min:3,max:23})
        .withMessage('category name must be between 3 and 23 characters'),
    check('category')
        .notEmpty()
        .withMessage('category id required')
        .isMongoId()
        .withMessage('invalid category id format'),
    validatorMiddleware,
];
exports.updateSubCategoryValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid category id format'),
    check('name')
        .optional()
        .notEmpty()
        .withMessage('category name required')
        .isLength({min:3,max:23})
        .withMessage('category name must be between 3 and 23 characters'),
    check('category')
        .optional()
        .notEmpty()
        .withMessage('category id required')
        .isMongoId()
        .withMessage('invalid category id format'),
    validatorMiddleware,
];
exports.getSubCategoryValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid category id format'),
    validatorMiddleware,
];
exports.deleteSubCategoryValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid category id format'),
    validatorMiddleware,
];




