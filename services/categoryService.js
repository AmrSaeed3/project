// This file contains the service layer for category-related operations.
const sharp = require("sharp");
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const {uploadSingleImage}= require("../middleware/uploadImageMiddleware");
const Category = require("../models/categoryModel");



// Upload single image

exports.uploadCategoryImage =uploadSingleImage('image');
// Image processing

// This function resizes the uploaded image and saves it to the server.
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/categories/${filename}`);

    //save image in db
    req.body.image = filename;
    next();
});


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