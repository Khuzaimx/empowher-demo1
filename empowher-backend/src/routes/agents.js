const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { recordOutcome, getDecisionHistory, getUserMemory, getInterventionAnalytics } = require('../controllers/agentController');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/agents/outcomes
 * @desc    Record intervention outcome for reflection loop
 * @access  Private
 */
router.post('/outcomes', recordOutcome);

/**
 * @route   GET /api/agents/decisions
 * @desc    Get agent decision history
 * @access  Private
 */
router.get('/decisions', getDecisionHistory);

/**
 * @route   GET /api/agents/memory
 * @desc    Get user memory and trends
 * @access  Private
 */
router.get('/memory', getUserMemory);

/**
 * @route   GET /api/agents/analytics
 * @desc    Get intervention success analytics
 * @access  Private
 */
router.get('/analytics', getInterventionAnalytics);

module.exports = router;
