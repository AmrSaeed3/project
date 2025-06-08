
const express = require('express');
const { protect } = require('../services/auth/index');
const { 
    addAddressValidator,
    updateAddressValidator 
} = require('../utils/validators/addressValidator');

const {
    addUserAddress,
    getUserAddress,
    updateUserAddress,
    deleteUserAddress
} = require('../services/addressService');

const router = express.Router();

// /api/v1/address
router.route('/')
    .post(
        protect,
        addAddressValidator,
        addUserAddress
    )
    .get(
        protect,
        getUserAddress
    )
    .put(
        protect,
        updateAddressValidator,
        updateUserAddress
    )
    .delete(
        protect,
        deleteUserAddress
    );

module.exports = router;

