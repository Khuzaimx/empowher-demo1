const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { skillProgressValidation } = require('../middleware/validation');
const {
    getRecommendations,
    getSkillModule,
    startSkill,
    updateProgress,
    completeSkill,
    getUserProgress
} = require('../controllers/skillController');

// All routes require authentication
router.use(authenticateToken);

// Get recommendations and user progress
router.get('/recommended', getRecommendations);
router.get('/progress', getUserProgress);

// Skill module operations
router.get('/:id', getSkillModule);
router.post('/:id/start', startSkill);
router.put('/:id/progress', skillProgressValidation, updateProgress);
router.post('/:id/complete', completeSkill);

module.exports = router;
