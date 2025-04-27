// This file contains the service layer for category-related operations.
const Brand = require("../models/brandModel");
// This file contains the service layer for brand-related operations.
const factory = require("./handlersFactory");



// This function sets the category ID to the request body for nested routes.
exports.createBrand = factory.createOne(Brand);

// This function retrieves all brands from the database.
exports.getBrand = factory.getAll(Brand)

// This function retrieves a single brand by its ID from the database.
exports.getBrandByID = factory.getOne(Brand);

// This function updates a brand by its ID in the database.
exports.updateBrandByID = factory.updateOne(Brand);

// This function deletes a brand by its ID from the database.
exports.deleteBrandByID = factory.deleteOne(Brand);
