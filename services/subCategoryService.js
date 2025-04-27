

const SubCategory = require("../models/subCategoryModel");

const factory = require("./handlersFactory");



// This function sets the category ID to the request body for nested routes.
exports.setcategoryIdToBody = (req, res, next) => {
    // Allow nested routes
    if (!req.body.category) req.body.category = req.params.categoryId;
    next();
};

// This function sets the filter object for the request based on the category ID.
exports.creatFilterObject = (req, res, next) => {
    let filterObject = {};
    if (req.params.categoryId) filterObject = { category: req.params.categoryId };
    req.filterObj = filterObject;
    next();
};

// This function creates a new subcategory in the database
exports.createSubCategory = factory.createOne(SubCategory);

// This function retrieves all subcategories from the database
exports.getSubCategory = factory.getAll(SubCategory);

// This function retrieves a single subcategory by its ID from the database
exports.getSubCategoryByID = factory.getOne(SubCategory);

// This function updates a subcategory by its ID in the database
exports.updateSubCategoryByID = factory.updateOne(SubCategory);

// This function deletes a subcategory by its ID from the database
exports.deleteSubcategoryByID = factory.deleteOne(SubCategory);