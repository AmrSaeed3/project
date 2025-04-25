const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const Category = require("../models/categoryModel");
const ApiError = require('../utils/apiError');

exports.createCategory = asyncHandler(async(req,res) =>{
    const name = req.body.name;
    const category = 
    
        await Category
        .create({name,slug:slugify(name)})
    res
        .status(201)
        .json({data: category})
});

exports.getCategory = asyncHandler(async (req,res) =>{
    const page = req.query.page * 1 || 1;
    const limit =req.query.limit*1||5;
    const skip = (page -1)*limit

    const categories = 
        await Category
            .find({})
            .skip(skip)
            .limit(limit);
    res
            .status(200)
            .json({result:categories.length ,page, data:categories});
});

exports.getCategoryByID = asyncHandler(async (req,res,next) =>{
    const {id}=req.params
    const category =
        await Category
            .findById(id);
    
    !category? next(new ApiError(`no category found for this id ${id}`,404))
    :res
        .status(200)
        .json({data:category});
});

exports.updateCategoryByID = asyncHandler (async(req,res,next) =>{
    const{id}= req.params;
    const {name} = req.body;
    const category = 
        await Category
            .findOneAndUpdate({_id: id},{name,slug:slugify(name)},{new:true});
    
    !category? next(new ApiError(`no category found for this id ${id}`,404))
    :res
        .status(200)
        .json({data:category});

});

exports.deletecategoryByID = asyncHandler(async(req,res,next) =>{
    const {id} =req.params;
    const category = 
        await Category
            .findByIdAndDelete(id)
    
    !category? next(new ApiError(`no category found for this id ${id}`,404))
    :res
        .status(200)
        .json({data:category});

});