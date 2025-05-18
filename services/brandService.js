
const sharp = require("sharp");
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const {uploadSingleImage}= require("../middleware/uploadImageMiddleware");
const Brand = require("../models/brandModel");





// This function handles the image upload for brands.
exports.uploadBrandImage =uploadSingleImage('image');

// This function resizes the uploaded image and saves it to the server.
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/brands/${filename}`);

    //save image in db
    req.body.image = filename;
    next();
});


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
