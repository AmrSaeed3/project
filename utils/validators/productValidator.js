const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");
const Brand = require("../../models/brandModel"); 

exports.createProductValidator = [
    check("name")
        .isLength({ min: 3 })
        .withMessage("must be at least 3 chars")
        .notEmpty()
        .withMessage("Product required")
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        })
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check("description")
        .notEmpty()
        .withMessage("Product description is required")
        .isLength({ max: 2000 })
        .withMessage("Too long description"),
    check("quantity")
        .notEmpty()
        .withMessage("Product quantity is required")
        .isNumeric()
        .withMessage("Product quantity must be a number"),
    check("sold")
        .optional()
        .isNumeric()
        .withMessage("Product quantity must be a number"),
    check("price")
        .notEmpty()
        .withMessage("Product price is required")
        .isNumeric()
        .withMessage("Product price must be a number")
        .isLength({ max: 32 })
        .withMessage("To long price"),
    check("priceAfterDiscount")
        .optional()
        .isNumeric()
        .withMessage("Product priceAfterDiscount must be a number")
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.price <= value) {
                throw new Error("priceAfterDiscount must be lower than price");
            }
            return true;
        }),
    check("sizes")
        .optional()
        .isArray()
        .withMessage("Available sizes should be array of string")
        .custom((val, { req }) => {
            if (val.length > 0) {
                req.body.sizes = val;
            }
            return true;
        }),
    check("colors")
        .optional()
        .isArray()
        .withMessage("availableColors should be array of string"),
    check("typecategory")
        .notEmpty()
        .withMessage("Product typecategory is required")
        .isLength({ min: 3 })
        .withMessage("Too short typecategory name")
        .isLength({ max: 23 })
        .withMessage("Too long typecategory name"),
    check("subcategory1")
        .notEmpty()
        .withMessage("Product subcategory1 is required")
        .isLength({ min: 3 })
        .withMessage("Too short subcategory1 name")
        .isLength({ max: 23 })
        .withMessage("Too long subcategory1 name"),
    check("subcategory2")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short subcategory2 name")
        .isLength({ max: 23 })
        .withMessage("Too long subcategory2 name"),

    check("imageCover")
        .notEmpty()
        .withMessage("Product imageCover is required"),
    check("images")
        .optional()
        .isArray()
        .withMessage("images should be array of string"),
    check("category")
        .notEmpty()
        .withMessage("Product must be belong to a category"),
    check("subcategories")
        .optional()
        .isMongoId()
        .withMessage("Invalid ID formate")
        .custom((subcategoriesIds) =>
            SubCategory.find({ _id: { $exists: true, $in: subcategoriesIds } }).then(
                (result) => {
                    if (result.length < 1 || result.length !== subcategoriesIds.length) {
                        return Promise.reject(new Error(`Invalid subcategories Ids`));
                    }
                }
            )
        )
        .custom((val, { req }) =>
            SubCategory.find({ category: req.body.category }).then(
                (subcategories) => {
                    const subCategoriesIdsInDB = [];
                    subcategories.forEach((subCategory) => {
                        subCategoriesIdsInDB.push(subCategory._id.toString());
                    });
                    // check if subcategories ids in db include subcategories in req.body (true)
                    const checker = (target, arr) => target.every((v) => arr.includes(v));
                    if (!checker(val, subCategoriesIdsInDB)) {
                        return Promise.reject(
                            new Error(`subcategories not belong to category`)
                        );
                    }
                }
            )
        ),

    check("brand")
        .optional()
        .isMongoId()
        .withMessage("Invalid ID format for brand")
        .custom((brandId) => {
            return Brand.findById(brandId).then((brand) => {
                if (!brand) {
                    return Promise.reject(
                        new Error(`No brand found for this ID: ${brandId}`)
                    );
                }
            });
        }),
    check("ratingsAverage")
        .optional()
        .isNumeric()
        .withMessage("ratingsAverage must be a number")
        .isLength({ min: 1 })
        .withMessage("Rating must be above or equal 1.0")
        .isLength({ max: 5 })
        .withMessage("Rating must be below or equal 5.0"),
    check("ratingsQuantity")
        .optional()
        .isNumeric()
        .withMessage("ratingsQuantity must be a number"),

    validatorMiddleware,
];

exports.getProductValidator = [
    check("id").isMongoId().withMessage("Invalid ID formate"),
    validatorMiddleware,
];

exports.updateProductValidator = [
    check("id").isMongoId().withMessage("Invalid ID formate"),
    check("name")
        .optional()
        .isLength({ min: 3 })
        .withMessage("must be at least 3 chars")
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        })
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check("description")
        .optional()
        .isLength({ max: 2000 })
        .withMessage("Too long description"),
    check("quantity")
        .optional()
        .isLength({ min: 1 })
        .withMessage("Product quantity is required")
        .isNumeric()
        .withMessage("Product quantity must be a number"),
    check("sold")
        .optional()
        .isNumeric()
        .withMessage("Product quantity must be a number"),
    check("price")
        .optional()
        .isNumeric()
        .withMessage("Product price must be a number")
        .isLength({ max: 32 })
        .withMessage("To long price"),
    check("priceAfterDiscount")
        .optional()
        .isNumeric()
        .withMessage("Product priceAfterDiscount must be a number")
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.price <= value) {
                throw new Error("priceAfterDiscount must be lower than price");
            }
            return true;
        }),
    check("sizes")
        .optional()
        .isArray()
        .withMessage("Available sizes should be array of string")
        .custom((val, { req }) => {
            if (val.length > 0) {
                req.body.sizes = val;
            }
            return true;
        }),
    check("colors")
        .optional()
        .isArray()
        .withMessage("availableColors should be array of string"),
    check("typecategory")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short typecategory name")
        .isLength({ max: 23 })
        .withMessage("Too long typecategory name"),
    check("subcategory1")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short subcategory1 name")
        .isLength({ max: 23 })
        .withMessage("Too long subcategory1 name"),
    check("subcategory2")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short subcategory2 name")
        .isLength({ max: 23 })
        .withMessage("Too long subcategory2 name"),

    check("imageCover")
        .optional(),
    check("images")
        .optional()
        .isArray()
        .withMessage("images should be array of string"),
    check("category")
        .notEmpty()
        .withMessage("Product must be belong to a category"),
    check("subcategories")
        .optional()
        .isMongoId()
        .withMessage("Invalid ID formate")
        .custom((subcategoriesIds) =>
            SubCategory.find({ _id: { $exists: true, $in: subcategoriesIds } }).then(
                (result) => {
                    if (result.length < 1 || result.length !== subcategoriesIds.length) {
                        return Promise.reject(new Error(`Invalid subcategories Ids`));
                    }
                }
            )
        )
        .custom((val, { req }) =>
            SubCategory.find({ category: req.body.category }).then(
                (subcategories) => {
                    const subCategoriesIdsInDB = [];
                    subcategories.forEach((subCategory) => {
                        subCategoriesIdsInDB.push(subCategory._id.toString());
                    });
                    // check if subcategories ids in db include subcategories in req.body (true)
                    const checker = (target, arr) => target.every((v) => arr.includes(v));
                    if (!checker(val, subCategoriesIdsInDB)) {
                        return Promise.reject(
                            new Error(`subcategories not belong to category`)
                        );
                    }
                }
            )
        ),

    check("brand")
        .optional()
        .isMongoId()
        .withMessage("Invalid ID format for brand")
        .custom((brandId) => {
            return Brand.findById(brandId).then((brand) => {
                if (!brand) {
                    return Promise.reject(
                        new Error(`No brand found for this ID: ${brandId}`)
                    );
                }
            });
        }),
    check("ratingsAverage")
        .optional()
        .isNumeric()
        .withMessage("ratingsAverage must be a number")
        .isLength({ min: 1 })
        .withMessage("Rating must be above or equal 1.0")
        .isLength({ max: 5 })
        .withMessage("Rating must be below or equal 5.0"),
    check("ratingsQuantity")
        .optional()
        .isNumeric()
        .withMessage("ratingsQuantity must be a number"),

    validatorMiddleware,
];

exports.deleteProductValidator = [
    check("id").isMongoId().withMessage("Invalid ID formate"),
    validatorMiddleware,
];
