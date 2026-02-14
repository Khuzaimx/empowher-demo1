const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getDashboard,
    exportData,
    deleteAccount,
    updateConsent
} = require('../controllers/userController');

// All routes require authentication
router.use(authenticateToken);

// User data operations
router.get('/dashboard', getDashboard);
router.get('/export', exportData);
router.delete('/account', deleteAccount);
router.post('/consent', updateConsent);

module.exports = router;
