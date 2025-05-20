const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const slugify = require("slugify");
const Category = require('../../models/categoryModel');

exports.createCategoryValidator = [
    check('name')
        .notEmpty()
        .withMessage('category name required')
        .isLength({ min: 3, max: 23 })
        .withMessage('category name must be between 3 and 23 characters')
        .custom(async (val, { req }) => {
            // Check if category name is unique
            const category = await Category.findOne({ name: val });
            if (category) {
                throw new Error('category name must be unique');
            }
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




