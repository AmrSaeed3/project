const express = require('express');
const {
    createCategoryValidator,
    updateCategoryValidator,
    getCategoryValidator,
    deletecategoryValidator

} = require('../utils/validators/categoryValidator');

const{createCategory,
    getCategory, 
    getCategoryByID,
    updateCategoryByID,
    deletecategoryByID
}=require("../services/categoryService")
const subCategoryRoute = require('./subCategoryRoute');
const router = express.Router();

// /api/category/subcategory
router.use('/:categoryId/subcategory',subCategoryRoute);


// /api/category
router.route('/')
.get(getCategory)
.post(createCategoryValidator,createCategory);

// /api/category/:id
router.route('/:id')
.get(getCategoryValidator,getCategoryByID)
.put(updateCategoryValidator,updateCategoryByID)
.delete(deletecategoryValidator,deletecategoryByID);

module.exports= router;