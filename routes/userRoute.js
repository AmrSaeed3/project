const express = require('express');
const {
    createUserValidator,
    updateUserValidator,
    getUserValidator,
    toggleUserActiveValidator,
    changeUserPasswordValidator
} = require('../utils/validators/userValidator');

const { protect, allowedTo } = require('../services/auth');

const {
    createUser,
    getUser,
    getUserByID,
    updateUserByID,
    toggleUserActiveStatus,
    uploadUserImage,
    resizeUserImage,
    changeUserPassword
} = require("../services/userService");

const router = express.Router();

// /api/v1/users
router.route('/')
    .get(
        protect,
        allowedTo('admin'),
        getUser)
    .post(
        protect,
        allowedTo('admin'),
        uploadUserImage,
        resizeUserImage,
        createUserValidator,
        createUser
    );

// /api/v1/users/:id
router.route('/:id')
    .get(
        protect,
        allowedTo('admin'),
        getUserValidator, getUserByID)
    .put(
        protect,
        allowedTo('admin'),
        uploadUserImage,
        resizeUserImage,
        updateUserValidator,
        updateUserByID
    );

// /api/v1/users/toggleActive/:id
router.patch(
    '/toggleActive/:id',
    protect,
    allowedTo('admin'),
    toggleUserActiveValidator,
    toggleUserActiveStatus
);

// /api/v1/users/changePassword/:id
router.put(
    '/changePassword/:id',
    protect,
    allowedTo('admin'),
    changeUserPasswordValidator,
    changeUserPassword
);

module.exports = router;
