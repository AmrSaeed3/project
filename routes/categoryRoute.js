const express = require('express');

const {
    createCategoryValidator,
    updateCategoryValidator,
    getCategoryValidator,
    deletecategoryValidator
} = require('../utils/validators/categoryValidator');

const authorization = require('../services/authService');

const { createCategory,
    getCategory,
    getCategoryByID,
    updateCategoryByID,
    deletecategoryByID
} = require("../services/categoryService");

const subCategoryRoute = require('./subCategoryRoute');

const router = express.Router();

// /api/category/subcategory
router.use('/:categoryId/subcategory', subCategoryRoute);


// /api/category
router.route('/')
    .get(getCategory)
    .post(
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
        createCategoryValidator, createCategory);

// /api/category/:id
router.route('/:id')
    .get(getCategoryValidator, getCategoryByID)
    .put(
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
        updateCategoryValidator, updateCategoryByID)
    .delete(
        authorization.protect,
        authorization.allowedTo('admin', 'manager'), 
        deletecategoryValidator, deletecategoryByID);

module.exports = router;