const {check} = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const slugify = require("slugify");
const Category = require("../../models/categoryModel");
const subCategoryModel = require('../../models/subCategoryModel');


exports.createSubCategoryValidator = [
    check('name')
        .notEmpty()
        .withMessage('category name required')
        .isLength({min:3,max:23})
        .withMessage('category name must be between 3 and 23 characters')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        })
        .custom(async (val, { req }) => {
                    // Check if subCategory name is unique
                    const subCategory = await subCategoryModel.findOne({ name: val });
                    if (subCategory) {
                        throw new Error('subCategory name must be unique');
                    }
                    req.body.slug = slugify(val);
                    return true;
                }),
    check('category')
        .notEmpty()
        .withMessage('category id required')
        .isMongoId()
        .withMessage('invalid category id format')
        .custom((val) => {
            return Category.findById(val).then((category) => {
                if (!category) {
                    return Promise.reject(
                        new Error(`No category found for this ID: ${val}`)
                    );
                }
            });
        }),
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
        .withMessage('category name must be between 3 and 23 characters')
        .custom((val, {req}) => {
            req.body.slug = slugify(val);
            return true;
            }),
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




