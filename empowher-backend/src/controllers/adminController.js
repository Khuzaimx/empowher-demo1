const db = require('../config/database');

/**
 * Get anonymized aggregated statistics (admin only)
 */
const getStats = async (req, res) => {
    try {
        // Total users
        const totalUsers = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE is_anonymous = false'
        );

        // Users by emotional level (last 7 days)
        const levelDistribution = await db.query(
            `SELECT emotional_level, COUNT(DISTINCT user_id) as user_count
       FROM emotional_entries
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY emotional_level`
        );

        // Skill engagement rate
        const skillEngagement = await db.query(
            `SELECT 
         COUNT(DISTINCT user_id) as active_users,
         COUNT(*) as total_activities,
         COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
       FROM user_skill_progress`
        );

        // Total check-ins
        const totalCheckins = await db.query(
            'SELECT COUNT(*) as count FROM emotional_entries'
        );

        // Average mood score (last 30 days)
        const avgMood = await db.query(
            `SELECT AVG(mood_score) as avg_mood
       FROM emotional_entries
       WHERE created_at >= NOW() - INTERVAL '30 days'`
        );

        res.json({
            total_users: parseInt(totalUsers.rows[0].count),
            emotional_level_distribution: levelDistribution.rows,
            skill_engagement: {
                active_users: parseInt(skillEngagement.rows[0].active_users),
                total_activities: parseInt(skillEngagement.rows[0].total_activities),
                completion_rate: skillEngagement.rows[0].total_activities > 0
                    ? (parseInt(skillEngagement.rows[0].completed_count) / parseInt(skillEngagement.rows[0].total_activities) * 100).toFixed(2)
                    : 0
            },
            total_checkins: parseInt(totalCheckins.rows[0].count),
            average_mood_30days: parseFloat(avgMood.rows[0].avg_mood || 0).toFixed(2)
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get all crisis helplines
 */
const getHelplines = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM crisis_helplines ORDER BY region, name'
        );

        res.json({ helplines: result.rows });
    } catch (error) {
        console.error('Get helplines error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update crisis helpline
 */
const updateHelpline = async (req, res) => {
    try {
        const { id } = req.params;
        const { region, name, phone_number, description, is_active } = req.body;

        const result = await db.query(
            `UPDATE crisis_helplines
       SET region = $1, name = $2, phone_number = $3, description = $4, is_active = $5
       WHERE id = $6
       RETURNING *`,
            [region, name, phone_number, description, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Helpline not found' });
        }

        res.json({
            message: 'Helpline updated',
            helpline: result.rows[0]
        });
    } catch (error) {
        console.error('Update helpline error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Create new crisis helpline
 */
const createHelpline = async (req, res) => {
    try {
        const { region, name, phone_number, description, is_active = true } = req.body;

        const result = await db.query(
            `INSERT INTO crisis_helplines (region, name, phone_number, description, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [region, name, phone_number, description, is_active]
        );

        res.status(201).json({
            message: 'Helpline created',
            helpline: result.rows[0]
        });
    } catch (error) {
        console.error('Create helpline error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Create new skill module
 */
const createSkillModule = async (req, res) => {
    try {
        const { title, description, difficulty, category, duration_minutes, content, points_reward = 10 } = req.body;

        const result = await db.query(
            `INSERT INTO skill_modules (title, description, difficulty, category, duration_minutes, content, points_reward)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [title, description, difficulty, category, duration_minutes, JSON.stringify(content), points_reward]
        );

        res.status(201).json({
            message: 'Skill module created',
            skill: result.rows[0]
        });
    } catch (error) {
        console.error('Create skill module error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update skill module
 */
const updateSkillModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, difficulty, category, duration_minutes, content, points_reward } = req.body;

        const result = await db.query(
            `UPDATE skill_modules
       SET title = $1, description = $2, difficulty = $3, category = $4, 
           duration_minutes = $5, content = $6, points_reward = $7
       WHERE id = $8
       RETURNING *`,
            [title, description, difficulty, category, duration_minutes, JSON.stringify(content), points_reward, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Skill module not found' });
        }

        res.json({
            message: 'Skill module updated',
            skill: result.rows[0]
        });
    } catch (error) {
        console.error('Update skill module error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getStats,
    getHelplines,
    updateHelpline,
    createHelpline,
    createSkillModule,
    updateSkillModule
};
