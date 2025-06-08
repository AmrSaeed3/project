const factory = require("./handlersFactory");
const Coupon = require("../models/couponModel");

// This function creates a new coupon in the database
exports.createCoupon = factory.createOne(Coupon);

// This function retrieves all coupons from the database
exports.getCoupon = factory.getAll(Coupon);

// This function retrieves a single coupon by its ID from the database
exports.getCouponByID = factory.getOne(Coupon);

// This function updates a coupon by its ID in the database
exports.updateCouponByID = factory.updateOne(Coupon);

// This function deletes a coupon by its ID from the database
exports.deleteCouponByID = factory.deleteOne(Coupon);
