const express = require('express');

const {
    createCouponValidator,
    updateCouponValidator,
    getCouponValidator,
    deleteCouponValidator
} = require('../utils/validators/couponValidator');

const { protect, allowedTo } = require('../services/auth/index');

const {
    createCoupon,
    getCoupon,
    getCouponByID,
    updateCouponByID,
    deleteCouponByID,
    verifyCoupon
} = require("../services/couponService");

const router = express.Router();

// /api/coupon
router.route('/')
    .get(getCoupon)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        createCouponValidator, createCoupon);

// /api/coupon/:id
router.route('/:id')
    .get(getCouponValidator, getCouponByID)
    .put(
        protect,
        allowedTo('admin', 'manager'),
        updateCouponValidator, updateCouponByID)
    .delete(
        protect,
        allowedTo('admin'),
        deleteCouponValidator, deleteCouponByID);


module.exports = router;
