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
    uploadBrandImage,
    resizeImage
}=require("../services/brandService")

const router = express.Router();

// /api/Brand
router.route('/')
.get(getBrand)
.post(createBrandValidator,uploadBrandImage,resizeImage,createBrand);

// /api/Brand/:id
router.route('/:id')
.get(getBrandValidator,getBrandByID)
.put(updateBrandValidator,uploadBrandImage,resizeImage,updateBrandByID)
.delete(deleteBrandValidator,deleteBrandByID);

module.exports= router;