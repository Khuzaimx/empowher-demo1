const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/demo/story/:userId
// Returns simulated hackathon story for a user
router.get('/story/:userId', authenticateToken, demoController.getDemoStory);

module.exports = router;
