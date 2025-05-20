const express = require('express');
const {
    createUserValidator,
    updateUserValidator,
    getUserValidator,
    toggleUserActiveValidator,
    changeUserPasswordValidator
} = require('../utils/validators/userValidator');

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
    );

// /api/v1/users/toggleActive/:id
router.patch(
    '/toggleActive/:id',
    toggleUserActiveValidator,
    toggleUserActiveStatus
);

// /api/v1/users/changePassword/:id
router.put(
    '/changePassword/:id',
    changeUserPasswordValidator,
    changeUserPassword
);

module.exports = router;
