const AgentOrchestrator = require('../agents/AgentOrchestrator');
const db = require('../config/database');

/**
 * Record intervention outcome (for reflection loop)
 */
const recordOutcome = async (req, res) => {
    try {
        const { decisionId, action, completed, rating, timeToComplete } = req.body;
        const userId = req.user.id;

        const orchestrator = new AgentOrchestrator();
        const outcome = await orchestrator.recordOutcome(
            userId,
            decisionId,
            action,
            completed,
            rating,
            timeToComplete
        );

        res.status(201).json({
            outcome,
            message: 'Outcome recorded successfully. Thank you for your feedback!'
        });
    } catch (error) {
        console.error('Record outcome error:', error);
        res.status(500).json({ error: 'Server error recording outcome' });
    }
};

/**
 * Get agent decision history for current user
 */
const getDecisionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        const orchestrator = new AgentOrchestrator();
        const decisions = await orchestrator.getDecisionHistory(userId, limit);

        res.json({
            decisions,
            count: decisions.length
        });
    } catch (error) {
        console.error('Get decision history error:', error);
        res.status(500).json({ error: 'Server error fetching decision history' });
    }
};

/**
 * Get user memory and trends
 */
const getUserMemory = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            'SELECT * FROM user_memory WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                message: 'No memory data yet. Complete a few check-ins to see your trends!'
            });
        }

        const memory = result.rows[0];

        res.json({
            trendDirection: memory.trend_direction,
            engagementScore: memory.engagement_score,
            longTermSummary: memory.long_term_summary,
            lastUpdated: memory.last_updated
        });
    } catch (error) {
        console.error('Get user memory error:', error);
        res.status(500).json({ error: 'Server error fetching memory' });
    }
};

/**
 * Get intervention success rates (for analytics)
 */
const getInterventionAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT 
                recommended_action,
                COUNT(*) as total_attempts,
                COUNT(CASE WHEN user_completed = true THEN 1 END) as completed,
                AVG(CASE WHEN outcome_rating IS NOT NULL THEN outcome_rating END) as avg_rating,
                AVG(CASE WHEN time_to_complete IS NOT NULL THEN time_to_complete END) as avg_time
             FROM intervention_outcomes
             WHERE user_id = $1
             GROUP BY recommended_action
             ORDER BY completed DESC`,
            [userId]
        );

        res.json({
            analytics: result.rows.map(row => ({
                action: row.recommended_action,
                totalAttempts: parseInt(row.total_attempts),
                completed: parseInt(row.completed),
                completionRate: (parseInt(row.completed) / parseInt(row.total_attempts) * 100).toFixed(1),
                avgRating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(2) : null,
                avgTimeMinutes: row.avg_time ? parseFloat(row.avg_time).toFixed(1) : null
            }))
        });
    } catch (error) {
        console.error('Get intervention analytics error:', error);
        res.status(500).json({ error: 'Server error fetching analytics' });
    }
};

module.exports = {
    recordOutcome,
    getDecisionHistory,
    getUserMemory,
    getInterventionAnalytics
};
