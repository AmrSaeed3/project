const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");



exports.deleteOne = Model =>exports.deleteProductByID = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    !document
        ? next(new ApiError(`no document found for this id ${id}`, 404))
        : res.status(200).json({
            message: `document deleted successfully with id : ${id}`,
        });
});

exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        });

        !document ? next(new ApiError(`no document found for this id ${id}`, 404))
        : res
            .status(200)
            .json({message: "document updated successfully",  data: document });
    });

exports.createOne = (Model) =>
    asyncHandler(async (req, res) => {
        const newDoc = await Model.create(req.body);
        res.status(201).json({ data: newDoc });
    });


exports.getOne = (Model) =>asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = 
    await Model
        .findById(id);

    !document
    ? next(new ApiError(`No document found for this ID ${id}`, 404))
    : res
        .status(200)
        .json({ data: document });
});


exports.getAll = (Model, modelName = '') =>
    asyncHandler(async (req, res) => {
        let filter = {};
        if (req.filterObj) filter = req.filterObj;
        // Build query
        const documentsCounts = await Model.countDocuments();
        const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
        .paginate(documentsCounts)
        .filter()
        .search(modelName)
        .limitFields()
        .sort();

        // Execute query
        const { mongooseQuery, paginationResult } = apiFeatures;
        const documents = await mongooseQuery;

        res
        .status(200)
        .json({ results: documents.length, paginationResult, data: documents });
    });