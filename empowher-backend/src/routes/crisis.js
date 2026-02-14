const express = require('express');
const router = express.Router();
const { getHelplines } = require('../controllers/crisisController');

// Public route - no authentication required
router.get('/helplines', getHelplines);

module.exports = router;
