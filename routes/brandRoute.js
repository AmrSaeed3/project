const express = require('express');

const {
    createBrandValidator,
    updateBrandValidator,
    getBrandValidator,
    deleteBrandValidator
} = require('../utils/validators/brandValidator');

const authorization = require('../services/authService');

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
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
        createBrandValidator, createBrand);

// /api/Brand/:id
router.route('/:id')
    .get(getBrandValidator, getBrandByID)
    .put(
        authorization.protect,
        authorization.allowedTo('admin', 'manager'),
        updateBrandValidator, updateBrandByID)
    .delete(
        authorization.protect,
        authorization.allowedTo('admin'),
        deleteBrandValidator, deleteBrandByID);

module.exports = router;