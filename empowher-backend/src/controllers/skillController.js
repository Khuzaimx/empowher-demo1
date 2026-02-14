const db = require('../config/database');
const { recommendSkills } = require('../services/skillRecommender');

/**
 * Get personalized skill recommendations
 */
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's current emotional state
        const emotionalResult = await db.query(
            `SELECT emotional_level, energy_level, created_at
       FROM emotional_entries
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
            [userId]
        );

        if (emotionalResult.rows.length === 0) {
            return res.json({
                message: 'Please complete your first emotional check-in to get personalized recommendations',
                recommendations: []
            });
        }

        const { emotional_level, energy_level } = emotionalResult.rows[0];

        // Get user's recent interests
        const interestsResult = await db.query(
            `SELECT DISTINCT tag
       FROM interest_tags it
       JOIN emotional_entries ee ON it.entry_id = ee.id
       WHERE ee.user_id = $1 AND ee.created_at >= NOW() - INTERVAL '7 days'`,
            [userId]
        );

        const interests = interestsResult.rows.map(r => r.tag);

        // Get all available skills
        const skillsResult = await db.query(
            'SELECT * FROM skill_modules ORDER BY created_at DESC'
        );

        // Get user's completed skills
        const completedResult = await db.query(
            'SELECT skill_id FROM user_skill_progress WHERE user_id = $1 AND completed = true',
            [userId]
        );

        const completedSkillIds = completedResult.rows.map(r => r.skill_id);

        // Filter out completed skills
        const availableSkills = skillsResult.rows.filter(
            skill => !completedSkillIds.includes(skill.id)
        );

        // Get recommendations
        const recommendations = recommendSkills(emotional_level, energy_level, interests, availableSkills);

        res.json({
            emotional_level,
            energy_level,
            interests,
            recommendations: recommendations.map(skill => ({
                id: skill.id,
                title: skill.title,
                description: skill.description,
                category: skill.category,
                difficulty: skill.difficulty,
                duration_minutes: skill.duration_minutes,
                points_reward: skill.points_reward
            }))
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Server error fetching recommendations' });
    }
};

/**
 * Get skill module details
 */
const getSkillModule = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT * FROM skill_modules WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Skill module not found' });
        }

        res.json({ skill: result.rows[0] });
    } catch (error) {
        console.error('Get skill module error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Start a skill module
 */
const startSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if already started
        const existing = await db.query(
            'SELECT id FROM user_skill_progress WHERE user_id = $1 AND skill_id = $2',
            [userId, id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Skill already started' });
        }

        // Create progress entry
        const result = await db.query(
            `INSERT INTO user_skill_progress (user_id, skill_id, progress_percentage)
       VALUES ($1, $2, 0)
       RETURNING *`,
            [userId, id]
        );

        res.status(201).json({
            message: 'Skill started successfully',
            progress: result.rows[0]
        });
    } catch (error) {
        console.error('Start skill error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update skill progress
 */
const updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress_percentage } = req.body;
        const userId = req.user.id;

        const result = await db.query(
            `UPDATE user_skill_progress
       SET progress_percentage = $1
       WHERE user_id = $2 AND skill_id = $3
       RETURNING *`,
            [progress_percentage, userId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Progress not found. Start the skill first.' });
        }

        res.json({
            message: 'Progress updated',
            progress: result.rows[0]
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Mark skill as completed
 */
const completeSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get skill points
        const skillResult = await db.query(
            'SELECT points_reward FROM skill_modules WHERE id = $1',
            [id]
        );

        if (skillResult.rows.length === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        const points = skillResult.rows[0].points_reward;

        // Update progress
        const result = await db.query(
            `UPDATE user_skill_progress
       SET completed = true, progress_percentage = 100, completed_at = NOW()
       WHERE user_id = $1 AND skill_id = $2
       RETURNING *`,
            [userId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Progress not found. Start the skill first.' });
        }

        res.json({
            message: 'Skill completed! Great job!',
            progress: result.rows[0],
            points_earned: points
        });
    } catch (error) {
        console.error('Complete skill error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get user's skill progress
 */
const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT usp.*, sm.title, sm.category, sm.points_reward
       FROM user_skill_progress usp
       JOIN skill_modules sm ON usp.skill_id = sm.id
       WHERE usp.user_id = $1
       ORDER BY usp.started_at DESC`,
            [userId]
        );

        res.json({ progress: result.rows });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getRecommendations,
    getSkillModule,
    startSkill,
    updateProgress,
    completeSkill,
    getUserProgress
};
