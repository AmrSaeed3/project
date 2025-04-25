const express = require('express');

const {
    createSubCategoryValidator,
    updateSubCategoryValidator,
    getSubCategoryValidator,
    deleteSubCategoryValidator
} = require('../utils/validators/subCategoryValidator');


const{
    createSubCategory,
    getSubCategory, 
    getSubCategoryByID,
    updateSubCategoryByID,
    deleteSubcategoryByID,
    creatFilterObject,
    setcategoryIdToBody
}=require("../services/subCategoryService")


const router = express.Router({mergeParams:true});

// /api/subcategory
router.route('/')
.get(creatFilterObject,getSubCategory)
.post(setcategoryIdToBody,createSubCategoryValidator,createSubCategory);

// /api/subcategory/:id

router.route('/:id')
.get(getSubCategoryValidator,getSubCategoryByID)
.put(updateSubCategoryValidator,updateSubCategoryByID)
.delete(deleteSubCategoryValidator,deleteSubcategoryByID);

module.exports= router;