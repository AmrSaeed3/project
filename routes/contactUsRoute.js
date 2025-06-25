const express = require('express');
const { sendEmail } = require('../services/contactUsService');
const { sendEmailValidator } = require('../utils/validators/constactUsValidator');
const router = express.Router();
const { protect, allowedTo } = require('../services/auth/index');

// If you want to allow anyone to contact you, remove protect/allowedTo
router.post('/', protect, allowedTo('user'), sendEmailValidator, sendEmail);

module.exports = router;