const express = require('express');
const { sendPhoneOtp, verifyPhoneOtp } = require('../services/auth/phoneOtpService');
const router = express.Router();

router.post('/send-otp', sendPhoneOtp);
router.post('/verify-otp', verifyPhoneOtp);

module.exports = router;

// In your main app.js or server.js
