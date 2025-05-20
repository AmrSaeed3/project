const express = require('express');

const {
    createSubCategoryValidator,
    updateSubCategoryValidator,
    getSubCategoryValidator,
    deleteSubCategoryValidator
} = require('../utils/validators/subCategoryValidator');

const authorization = require('../services/authService');

const {
    createSubCategory,
    getSubCategory,
    getSubCategoryByID,
    updateSubCategoryByID,
    deleteSubcategoryByID,
    creatFilterObject,
    setcategoryIdToBody
} = require("../services/subCategoryService")


const router = express.Router({ mergeParams: true });

// /api/subcategory
router.route('/')
    .get(creatFilterObject, getSubCategory)
    .post(
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
        setcategoryIdToBody,
        createSubCategoryValidator, createSubCategory);

// /api/subcategory/:id

router.route('/:id')
    .get(getSubCategoryValidator, getSubCategoryByID)
    .put(
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
        updateSubCategoryValidator, updateSubCategoryByID)
    .delete(
        authorization.protect,
        authorization.allowedTo('admin'),
        deleteSubCategoryValidator, deleteSubcategoryByID);

module.exports = router;