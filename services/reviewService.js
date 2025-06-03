
const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");

// Nested route middleware to set product ID and user ID from request
exports.setProductIdAndUserIdToBody = (req, res, next) => {
    // If product ID is not in the body, get it from the URL params
    if (!req.body.product) req.body.product = req.params.productId;
    // If user ID is not in the body, get it from the authenticated user
    if (!req.body.user) req.body.user = req.user._id;
    next();
};

// This function creates a new review
exports.createReview = factory.createOne(Review);

// This function retrieves all reviews from the database.
exports.getReview = factory.getAll(Review);

// This function retrieves a single review by its ID from the database.
exports.getReviewByID = factory.getOne(Review);

// This function updates a review by its ID in the database.
exports.updateReviewByID = factory.updateOne(Review);

// This function deletes a review by its ID from the database.
exports.deleteReviewByID = factory.deleteOne(Review);
