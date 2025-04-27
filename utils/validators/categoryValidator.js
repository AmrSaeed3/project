const {check} = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const slugify = require("slugify");


exports.createCategoryValidator = [
    check('name')
        .notEmpty()
        .withMessage('category name required')
        .isLength({min:3,max:23})
        .withMessage('category name must be between 3 and 23 characters')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    validatorMiddleware,
];
exports.updateCategoryValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid category id format')
        .optional()
        .notEmpty()
        .withMessage('category name required')
        .isLength({min:3,max:23})
        .withMessage('category name must be between 3 and 23 characters'),
    check('name').custom((val, {req}) => {
        req.body.slug = slugify(val);
        return true;
        }),
    validatorMiddleware,
];
exports.getCategoryValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid category id format'),
    validatorMiddleware,
];
exports.deletecategoryValidator = [
    check('id')
        .isMongoId()
        .withMessage('invalid category id format'),
    validatorMiddleware,
];




