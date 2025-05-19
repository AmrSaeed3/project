const express = require('express');
const {
    createUserValidator,
    updateUserValidator,
    getUserValidator,
    deleteUserValidator
} = require('../utils/validators/userValidator');

const {
    createUser,
    getUser,
    getUserByID,
    updateUserByID,
    deleteUserByID,
    uploadUserImage,
    resizeUserImage
} = require("../services/userService");

const router = express.Router();

// /api/v1/users
router.route('/')
    .get(getUser)
    .post(
        uploadUserImage,
        resizeUserImage,
        createUserValidator,
        createUser
    );

// /api/v1/users/:id
router.route('/:id')
    .get(getUserValidator, getUserByID)
    .put(
        uploadUserImage,
        resizeUserImage,
        updateUserValidator,
        updateUserByID
    )
    .delete(deleteUserValidator, deleteUserByID);

module.exports = router;