const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const { uploadMixOfImages } = require('../middleware/uploadImageMiddleware');

const Product = require("../models/productModel");
const factory = require("./handlersFactory");



exports.uploadProductImages = uploadMixOfImages([
    {
        name: 'imageCover',
        maxCount: 1,
    },
    {
        name: 'images',
        maxCount: 5,
    },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
    // console.log(req.files);
    //1- Image processing for imageCover
    if (req.files.imageCover) {
        const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

        await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`uploads/products/${imageCoverFileName}`);

        // Save image into our db
        req.body.imageCover = imageCoverFileName;
    }

    //2- Image processing for images
    if (req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (img, index) => {
                const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

                await sharp(img.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 95 })
                    .toFile(`uploads/products/${imageName}`);

                // Save image into our db
                req.body.images.push(imageName);
            })
        );

        next();
    }
});
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
