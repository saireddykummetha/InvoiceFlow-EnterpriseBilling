const express = require('express');
const c = require('../controllers');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Current User Profile (session verification)
router.get(['/me', '/me/'], protect, c.getMe);

// Signup (email OTP)
router.post(['/register/request-otp', '/register/request-otp/'], c.requestSignupOtp);
router.post(['/register/resend-otp', '/register/resend-otp/'], c.resendSignupOtp);
router.post(['/register/verify-otp', '/register/verify-otp/'], c.verifySignupOtp);

// Login & Session
router.post(['/login', '/login/'], c.login);
router.post(['/refresh', '/refresh/'], c.refresh);
router.post(['/logout', '/logout/'], c.logout);

// Forgot / Reset Password
router.post(['/forgot-password', '/forgot-password/'], c.forgotPassword);
router.post(['/forgot-password/resend-otp', '/forgot-password/resend-otp/'], c.resendPasswordResetOtp);
router.post(['/reset-password', '/reset-password/'], c.resetPassword);

// Authenticated Password Change
router.post(['/change-password', '/change-password/'], protect, c.changePassword);

// Social Login
router.post(['/google', '/google/'], c.googleAuth);

module.exports = router;
