const express = require('express');
const {
    createProductValidator,
    updateProductValidator,
    getProductValidator,
    deleteProductValidator

} = require('../utils/validators/productValidator');

const{createProduct,
    getProduct, 
    getProductByID,
    updateProductByID,
    deleteProductByID,
    uploadProductImages,
    resizeProductImages
}=require("../services/productService")

const router = express.Router();



// /api/Product
router.route('/')
.get(getProduct)
.post(createProductValidator,uploadProductImages,resizeProductImages,createProduct);

// /api/Product/:id
router.route('/:id')
.get(getProductValidator,getProductByID)
.put(updateProductValidator,uploadProductImages,resizeProductImages,updateProductByID)
.delete(deleteProductValidator,deleteProductByID);

module.exports= router;