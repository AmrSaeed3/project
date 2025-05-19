const express = require('express');
const {
createBrandValidator ,
updateBrandValidator ,        
getBrandValidator ,        
deleteBrandValidator       

} = require('../utils/validators/brandValidator');

const{createBrand,
    getBrand, 
    getBrandByID,
    updateBrandByID,
    deleteBrandByID,

}=require("../services/brandService")

const router = express.Router();

// /api/Brand
router.route('/')
.get(getBrand)
.post(createBrandValidator,createBrand);

// /api/Brand/:id
router.route('/:id')
.get(getBrandValidator,getBrandByID)
.put(updateBrandValidator,updateBrandByID)
.delete(deleteBrandValidator,deleteBrandByID);

module.exports= router;