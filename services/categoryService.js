// This file contains the service layer for category-related operations.
const factory = require("./handlersFactory");
const Category = require("../models/categoryModel");






// This function sets the category ID to the request body for nested routes.
exports.createCategory = factory.createOne(Category);

// This function retrieves all categories from the database.
exports.getCategory = factory.getAll(Category);

// This function retrieves a single category by its ID from the database.
exports.getCategoryByID = factory.getOne(Category);

// This function updates a category by its ID in the database.
exports.updateCategoryByID = factory.updateOne(Category);

// This function deletes a category by its ID from the database.
exports.deletecategoryByID =factory.deleteOne(Category);