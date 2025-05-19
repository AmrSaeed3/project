
const factory = require("./handlersFactory");
const User = require("../models/userModel");
const { uploadUserImage, resizeUserImage } = require('../middleware/uploadImageMiddleware');

// Export the image upload middlewares
exports.uploadUserImage = uploadUserImage;
exports.resizeUserImage = resizeUserImage;

// This function sets the category ID to the request body for nested routes.
exports.createUser = factory.createOne(User);

// This function retrieves all Users from the database.
exports.getUser = factory.getAll(User);

// This function retrieves a single User by its ID from the database.
exports.getUserByID = factory.getOne(User);

// This function updates a User by its ID in the database.
exports.updateUserByID = factory.updateOne(User);

// This function deletes a User by its ID from the database.
exports.deleteUserByID = factory.deleteOne(User);
