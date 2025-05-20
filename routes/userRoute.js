const express = require('express');
const {
    createUserValidator,
    updateUserValidator,
    getUserValidator,
    toggleUserActiveValidator,
    changeUserPasswordValidator
} = require('../utils/validators/userValidator');

const authorization = require('../services/authService');

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
        authorization.protect,
        authorization.allowedTo('admin'),
        getUser)
    .post(
        authorization.protect,
        authorization.allowedTo('admin'),
        uploadUserImage,
        resizeUserImage,
        createUserValidator,
        createUser
    );

// /api/v1/users/:id
router.route('/:id')
    .get(
        authorization.protect,
        authorization.allowedTo('admin'),
        getUserValidator, getUserByID)
    .put(
        authorization.protect,
        authorization.allowedTo('admin'),
        uploadUserImage,
        resizeUserImage,
        updateUserValidator,
        updateUserByID
    );

// /api/v1/users/toggleActive/:id
router.patch(
    '/toggleActive/:id',
    authorization.protect,
    authorization.allowedTo('admin'),
    toggleUserActiveValidator,
    toggleUserActiveStatus
);

// /api/v1/users/changePassword/:id
router.put(
    '/changePassword/:id',
    authorization.protect,
    authorization.allowedTo('admin'),
    changeUserPasswordValidator,
    changeUserPassword
);

module.exports = router;
