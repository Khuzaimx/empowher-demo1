const express = require('express');
const router = express.Router();
const { signupValidation, loginValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');
const {
    signup,
    login,
    logout,
    getCurrentUser,
    createAnonymousSession
} = require('../controllers/authController');

// Public routes with rate limiting
router.post('/signup', authLimiter, signupValidation, signup);
router.post('/login', authLimiter, loginValidation, login);
router.post('/anonymous', authLimiter, createAnonymousSession);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
