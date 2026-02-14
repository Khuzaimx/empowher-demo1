const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkinValidation } = require('../middleware/validation');
const { checkinLimiter } = require('../middleware/rateLimiter');
const {
    submitCheckin,
    getEmotionalHistory,
    getCurrentLevel,
    getEntry
} = require('../controllers/emotionalController');

// All routes require authentication
router.use(authenticateToken);

// Submit check-in with rate limiting
router.post('/checkin', checkinLimiter, checkinValidation, submitCheckin);

// Get emotional data
router.get('/history', getEmotionalHistory);
router.get('/current-level', getCurrentLevel);
router.get('/entry/:id', getEntry);

module.exports = router;
