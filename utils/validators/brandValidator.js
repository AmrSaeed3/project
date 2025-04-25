const {check} = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');


exports.createBrandValidator = [
    check('name')
        .notEmpty()
        .withMessage('Brand name required')
        .isLength({min:3,max:23})
        .withMessage('Brand name must be between 3 and 23 characters'),
    validatorMiddleware,
];
exports.updateBrandValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid Brand id format'),
    check('name')
        .optional()
        .notEmpty()
        .withMessage('Brand name required')
        .isLength({min:3,max:23})
        .withMessage('Brand name must be between 3 and 23 characters'),
    validatorMiddleware,
];
exports.getBrandValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid Brand id format'),
    validatorMiddleware,
];
exports.deleteBrandValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid Brand id format'),
    validatorMiddleware,
];




