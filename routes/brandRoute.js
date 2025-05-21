const express = require('express');

const {
    createBrandValidator,
    updateBrandValidator,
    getBrandValidator,
    deleteBrandValidator
} = require('../utils/validators/brandValidator');

const { protect, allowedTo } = require('../services/auth');

const { createBrand,
    getBrand,
    getBrandByID,
    updateBrandByID,
    deleteBrandByID,
} = require("../services/brandService")

const router = express.Router();

// /api/Brand
router.route('/')
    .get(getBrand)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        createBrandValidator, createBrand);

// /api/Brand/:id
router.route('/:id')
    .get(getBrandValidator, getBrandByID)
    .put(
        protect,
        allowedTo('admin', 'manager'),
        updateBrandValidator, updateBrandByID)
    .delete(
        protect,
        allowedTo('admin'),
        deleteBrandValidator, deleteBrandByID);

module.exports = router;
