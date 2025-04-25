
const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const Category = require("../models/categoryModel");
const ApiError = require('../utils/apiError');
const SubCategory = require("../models/subCategoryModel");

exports.setcategoryIdToBody = (req, res, next) => {
    // Allow nested routes
    if (!req.body.category) req.body.category = req.params.categoryId;
    next();
};


exports.createSubCategory = asyncHandler(async (req, res, next) => {
    const { name, category } = req.body;

    // Check if the category exists
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
        return next(new ApiError(`Category with ID ${category} does not exist`, 404));
    }

    // Create the subcategory
    const subCategory = await SubCategory.create({
        name,
        slug: slugify(name),
        category
    });

    res.status(201).json({ data: subCategory });
});

exports.creatFilterObject = (req, res, next) => {
    let filterObject = {};
    if (req.params.categoryId) filterObject = { category: req.params.categoryId };
    req.filterObj = filterObject;
    next();
};


exports.getSubCategory = asyncHandler(async (req, res) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit
    const subCategories = 
    await SubCategory
        .find(req.filterObj)
        .skip(skip)
        .limit(limit)
        // .populate({path:"category", select:"name-_id"});
    res
        .status(200)
        .json({ result: subCategories.length, page, data: subCategories });
});
// exports.getSubCategoryByCategory = asyncHandler(async (req, res) => {
//     const { id } = req.params
//     const subCategories = await SubCategory.find({ category: id }).populate("category");
//     !subCategories ? next(new ApiError(`no subCategory found for this id ${id}`, 404))
//         : res.status(200).json({ data: subCategories });
// });

exports.getSubCategoryByID = asyncHandler(async (req, res,next) => {
    const { id } = req.params
    const subCategory = 
    await SubCategory
        .findById(id)
        // .populate({path:"category", select:"name-_id"});

    !subCategory ? next(new ApiError(`no subCategory found for this id ${id}`, 404))
        : res
            .status(200)
            .json({ data: subCategory });
});

exports.updateSubCategoryByID = asyncHandler(async (req, res ,next) => {
    const { id } = req.params;
    const { name, category } = req.body;
    const subCategory =
    await SubCategory
        .findOneAndUpdate(
            { _id: id },
            { name, slug: slugify(name), category },
            { new: true })
        // .populate({path:"category", select:"name-_id"});

    !subCategory ? next(new ApiError(`no subCategory found for this id ${id}`, 404))
        : res
            .status(200)
            .json({ data: subCategory });
});

exports.deleteSubcategoryByID = asyncHandler(async (req, res,next) => {
    const { id } = req.params;
    const subCategory = 
        await SubCategory
            .findByIdAndDelete(id)

    !subCategory ? next(new ApiError(`no subCategory found for this id ${id}`, 404))
        : res
            .status(200)
            .json({ data: subCategory });
});
