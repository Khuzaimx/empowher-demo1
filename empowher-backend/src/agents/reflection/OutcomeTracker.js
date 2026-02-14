const db = require('../../config/database');

/**
 * Outcome Tracker
 * Tracks intervention outcomes and adjusts agent confidence
 */
class OutcomeTracker {
    /**
     * Record outcome of an intervention
     */
    async recordOutcome(userId, decisionId, action, completed, rating = null, timeToComplete = null) {
        const result = await db.query(
            `INSERT INTO intervention_outcomes 
       (user_id, decision_id, recommended_action, user_completed, outcome_rating, time_to_complete, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [userId, decisionId, action, completed, rating, timeToComplete, completed ? new Date() : null]
        );

        // If completed with rating, adjust agent confidence
        if (completed && rating !== null) {
            await this.adjustAgentConfidence(decisionId, rating);
        }

        return result.rows[0];
    }

    /**
     * Adjust agent confidence based on outcome
     */
    async adjustAgentConfidence(decisionId, rating) {
        // Get the original decision
        const decisionResult = await db.query(
            'SELECT * FROM agent_decisions WHERE id = $1',
            [decisionId]
        );

        if (decisionResult.rows.length === 0) {
            console.warn(`Decision ${decisionId} not found for confidence adjustment`);
            return;
        }

        const decision = decisionResult.rows[0];
        const { agent_name, confidence_score } = decision;

        // Calculate adjustment
        // Rating 5: +0.10, Rating 4: +0.05, Rating 3: 0, Rating 2: -0.05, Rating 1: -0.10
        const adjustment = (rating - 3) * 0.05;
        const newConfidence = Math.max(0, Math.min(1, parseFloat(confidence_score) + adjustment));

        // Store adjustment
        await db.query(
            `INSERT INTO agent_confidence_adjustments 
       (agent_name, original_confidence, adjusted_confidence, reason)
       VALUES ($1, $2, $3, $4)`,
            [
                agent_name,
                confidence_score,
                newConfidence,
                `User rating: ${rating}/5 (adjustment: ${adjustment > 0 ? '+' : ''}${adjustment.toFixed(2)})`
            ]
        );

        console.log(`Agent ${agent_name} confidence adjusted: ${confidence_score} → ${newConfidence.toFixed(2)}`);
    }

    /**
     * Get past outcomes for a user
     */
    async getPastOutcomes(userId, limit = 20) {
        const result = await db.query(
            `SELECT * FROM intervention_outcomes 
       WHERE user_id = $1 AND user_completed = true
       ORDER BY completed_at DESC 
       LIMIT $2`,
            [userId, limit]
        );

        return result.rows;
    }

    /**
     * Get success rate for a specific action type
     */
    async getActionSuccessRate(userId, actionType) {
        const result = await db.query(
            `SELECT 
         COUNT(*) as total,
         COUNT(CASE WHEN outcome_rating >= 4 THEN 1 END) as successful
       FROM intervention_outcomes
       WHERE user_id = $1 AND recommended_action = $2 AND user_completed = true`,
            [userId, actionType]
        );

        const { total, successful } = result.rows[0];

        if (parseInt(total) === 0) {
            return null; // No data
        }

        return parseInt(successful) / parseInt(total);
    }

    /**
     * Get average confidence for an agent
     */
    async getAgentAverageConfidence(agentName, limit = 50) {
        const result = await db.query(
            `SELECT AVG(adjusted_confidence) as avg_confidence
       FROM (
         SELECT adjusted_confidence 
         FROM agent_confidence_adjustments 
         WHERE agent_name = $1 
         ORDER BY created_at DESC 
         LIMIT $2
       ) recent`,
            [agentName, limit]
        );

        const avgConfidence = result.rows[0].avg_confidence;

        return avgConfidence ? parseFloat(avgConfidence) : null;
    }
}

module.exports = OutcomeTracker;
