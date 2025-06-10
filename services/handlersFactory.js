const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const ProductSimilarity = require('../models/productSimilarityModel');

// Make sure all models are imported at the top
// This ensures they're registered with Mongoose before any populate operations
require('../models/userModel');
require('../models/reviewModel');
require('../models/productModel');

exports.deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await Model.findByIdAndDelete(id);

        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: null,
            message: 'Document deleted successfully'
        });
    });

exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!document) {
            return next(
                new ApiError(`No document for this id ${req.params.id}`, 404)
            );
        }
        // Trigger "save" event when update document
        document.save();
        res.status(200).json({ data: document });
    });

exports.createOne = (Model) =>
    asyncHandler(async (req, res) => {
        const newDoc = await Model.create(req.body);
        res.status(201).json({ data: newDoc });
    });

exports.getOne = (Model, populationOpt) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        let query = Model.findById(id);

        if (populationOpt) {
            if (Array.isArray(populationOpt)) {
                populationOpt.forEach(opt => {
                    query = query.populate(opt);
                });
            } else {
                query = query.populate(populationOpt);
            }
        }

        const document = await query;

        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }

        // If this is a Product model, fetch similar products
        if (Model.modelName === 'Product') {
            try {
                // Find similar products from the ProductSimilarity collection
                const similarityData = await ProductSimilarity.findOne({ productId: id });

                // Convert document to a plain object so we can add properties
                const responseDoc = document.toObject();

                // Add similar products to the response if they exist
                if (similarityData && similarityData.similarProducts) {
                    // Get top 5 similar products
                    const topSimilarProducts = similarityData.similarProducts
                        .slice(0, 5)
                        .map(item => ({
                            productId: item.similarProductId,
                            similarityScore: item.similarityScore
                        }));

                    // Add to response
                    responseDoc.similarProducts = topSimilarProducts;

                    // If we have similar products, populate them with basic info
                    if (topSimilarProducts.length > 0) {
                        const productIds = topSimilarProducts.map(item => item.productId);
                        const similarProductsData = await Model.find(
                            { _id: { $in: productIds } },
                            'name imageCover price slug'
                        );

                        // Create a map for quick lookup
                        const productMap = {};
                        similarProductsData.forEach(product => {
                            productMap[product._id.toString()] = product;
                        });

                        // Replace IDs with actual product data
                        responseDoc.similarProducts = responseDoc.similarProducts.map(item => ({
                            product: productMap[item.productId.toString()],
                            similarityScore: item.similarityScore
                        }));
                    }
                } else {
                    responseDoc.similarProducts = [];
                }

                return res.status(200).json({ data: responseDoc });
            } catch (error) {
                console.error('Error fetching similar products:', error);
                // If there's an error with similar products, just return the document without them
                return res.status(200).json({ data: document });
            }
        }

        // For non-Product models, return as usual
        res.status(200).json({ data: document });
    });

exports.getAll = (Model) =>
    asyncHandler(async (req, res) => {
        let filter = {};
        if (req.filterObj) {
            filter = req.filterObj;
        }
        // Build query
        const documentsCounts = await Model.countDocuments();
        const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
            .search('Product')   // <-- must come before filter()
            .filter()
            .sort()
            .limitFields()
            .paginate(documentsCounts);

        // Execute query
        const { mongooseQuery, paginationResult } = apiFeatures;
        const documents = await mongooseQuery;

        res
            .status(200)
            .json({ results: documents.length, paginationResult, data: documents });
    });

