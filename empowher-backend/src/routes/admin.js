const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    getStats,
    getHelplines,
    updateHelpline,
    createHelpline,
    createSkillModule,
    updateSkillModule
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Statistics
router.get('/stats', getStats);

// Helpline management
router.get('/helplines', getHelplines);
router.post('/helplines', createHelpline);
router.put('/helplines/:id', updateHelpline);

// Skill module management
router.post('/skills', createSkillModule);
router.put('/skills/:id', updateSkillModule);

module.exports = router;
