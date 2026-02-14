const db = require('../config/database');
const { reconstructEncryptedData, decryptJournal } = require('../services/encryptionService');

/**
 * Get user dashboard data
 */
const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get mood trend (last 7 days)
        const moodTrend = await db.query(
            `SELECT mood_score, emotional_level, created_at
       FROM emotional_entries
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       ORDER BY created_at ASC`,
            [userId]
        );

        // Get total completed skills
        const completedSkills = await db.query(
            `SELECT COUNT(*) as count, COALESCE(SUM(sm.points_reward), 0) as total_points
       FROM user_skill_progress usp
       JOIN skill_modules sm ON usp.skill_id = sm.id
       WHERE usp.user_id = $1 AND usp.completed = true`,
            [userId]
        );

        // Get current emotional level
        const currentLevel = await db.query(
            `SELECT emotional_level, mood_score, created_at
       FROM emotional_entries
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
            [userId]
        );

        // Get in-progress skills
        const inProgress = await db.query(
            `SELECT usp.*, sm.title, sm.category
       FROM user_skill_progress usp
       JOIN skill_modules sm ON usp.skill_id = sm.id
       WHERE usp.user_id = $1 AND usp.completed = false
       ORDER BY usp.started_at DESC
       LIMIT 3`,
            [userId]
        );

        res.json({
            mood_trend: moodTrend.rows,
            stats: {
                completed_skills: parseInt(completedSkills.rows[0].count),
                total_points: parseInt(completedSkills.rows[0].total_points),
                total_checkins: moodTrend.rows.length
            },
            current_level: currentLevel.rows.length > 0 ? currentLevel.rows[0] : null,
            in_progress_skills: inProgress.rows
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Export all user data
 */
const exportData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user info
        const userResult = await db.query(
            'SELECT id, email, role, created_at FROM users WHERE id = $1',
            [userId]
        );

        // Get all emotional entries
        const entriesResult = await db.query(
            `SELECT * FROM emotional_entries WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        // Decrypt journals
        const entries = entriesResult.rows.map(entry => {
            let journal = null;
            if (entry.journal_encrypted) {
                const encryptedData = reconstructEncryptedData(entry);
                journal = decryptJournal(encryptedData);
            }

            return {
                id: entry.id,
                mood_score: entry.mood_score,
                energy_level: entry.energy_level,
                stress_level: entry.stress_level,
                emotional_level: entry.emotional_level,
                journal,
                created_at: entry.created_at
            };
        });

        // Get all skill progress
        const progressResult = await db.query(
            `SELECT usp.*, sm.title, sm.category
       FROM user_skill_progress usp
       JOIN skill_modules sm ON usp.skill_id = sm.id
       WHERE usp.user_id = $1
       ORDER BY usp.started_at DESC`,
            [userId]
        );

        // Get consents
        const consentsResult = await db.query(
            'SELECT * FROM user_consents WHERE user_id = $1',
            [userId]
        );

        const exportData = {
            user: userResult.rows[0],
            emotional_entries: entries,
            skill_progress: progressResult.rows,
            consents: consentsResult.rows,
            exported_at: new Date().toISOString()
        };

        res.json(exportData);
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Delete user account and all data
 */
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete user (cascade will delete all related data)
        await db.query('DELETE FROM users WHERE id = $1', [userId]);

        // Clear cookie
        res.clearCookie('token');

        res.json({
            message: 'Account and all associated data have been permanently deleted'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update user consent
 */
const updateConsent = async (req, res) => {
    try {
        const { consent_type, consented } = req.body;
        const userId = req.user.id;

        const result = await db.query(
            `INSERT INTO user_consents (user_id, consent_type, consented)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, consent_type)
       DO UPDATE SET consented = $3, consented_at = NOW()
       RETURNING *`,
            [userId, consent_type, consented]
        );

        res.json({
            message: 'Consent updated',
            consent: result.rows[0]
        });
    } catch (error) {
        console.error('Update consent error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getDashboard,
    exportData,
    deleteAccount,
    updateConsent
};
