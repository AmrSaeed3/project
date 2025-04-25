const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const Brand = require("../models/brandModel ");
const ApiError = require("../utils/apiError");

exports.createBrand = asyncHandler(async (req, res) => {
    const name = req.body.name;
    const brand = 
    await Brand
        .create({ name, slug: slugify(name) });
    res
        .status(201)
        .json({ data: brand });
});

exports.getBrand = asyncHandler(async (req, res) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;

    const brands = 
    await Brand
        .find({})
        .skip(skip)
        .limit(limit);
    res
        .status(200)
        .json({ result: brands.length, page, data: brands });
});

exports.getBrandByID = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const brand = 
    await Brand
        .findById(id);

    !brand
    ? next(new ApiError(`No brand found for this ID ${id}`, 404))
    : res
        .status(200)
        .json({ data: brand });
});

exports.updateBrandByID = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    const brand = 
    await Brand
        .findOneAndUpdate(
            { _id: id },
            { name, slug: slugify(name) },
            { new: true }
        );

    !brand
    ? next(new ApiError(`No brand found for this ID ${id}`, 404))
    : res
        .status(200)
        .json({ data: brand });
});

exports.deleteBrandByID = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const brand = 
    await Brand
        .findByIdAndDelete(id);

    !brand
    ? next(new ApiError(`No brand found for this ID ${id}`, 404))
    : res
    .status(200)
    .json({ data: brand });
});
