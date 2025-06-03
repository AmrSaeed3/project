// This file contains the routes for review-related operations.
const express = require('express');

const {
    createReviewValidator,
    getReviewValidator,
    updateReviewValidator,
    deleteReviewValidator,
} = require('../utils/validators/reviewValidator');

const { protect, allowedTo } = require('../services/auth/index');

const {
    createReview,
    getReview,
    getReviewByID,
    updateReviewByID,
    deleteReviewByID,
    setProductIdAndUserIdToBody,
} = require("../services/reviewService");

const router = express.Router({ mergeParams: true });

// /api/reviews
router.route('/')
    .get(getReview)
    .post(
        protect,
        allowedTo('user'),
        setProductIdAndUserIdToBody,
        createReviewValidator, 
        createReview
    );

// /api/reviews/:id
router.route('/:id')
    .get(getReviewValidator, getReviewByID)
    .put(
        protect,
        allowedTo('user'),
        updateReviewValidator, 
        updateReviewByID
    )
    .delete(
        protect,
        allowedTo('user', 'maneger', 'admin'),
        deleteReviewValidator, 
        deleteReviewByID
    );

module.exports = router;
