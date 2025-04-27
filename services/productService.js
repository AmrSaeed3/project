// This file contains the service layer for category-related operations.
const Product = require("../models/productModel");
const factory = require("./handlersFactory");

// This function sets the category ID to the request body for nested routes.
exports.createProduct = factory.createOne(Product);

// This function retrieves all categories from the database.
exports.getProduct = factory.getAll(Product)

// This function retrieves a single category by its ID from the database.
exports.getProductByID = factory.getOne(Product);

// This function updates a category by its ID in the database.
exports.updateProductByID = factory.updateOne(Product);

// This function deletes a category by its ID from the database.
exports.deleteProductByID  = factory.deleteOne(Product); 
