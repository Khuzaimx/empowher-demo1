const db = require('../../config/database');

/**
 * Adaptive Intervention Agent (Priority 3)
 * Recommends wellness interventions based on emotional state and past outcomes
 */
class AdaptiveInterventionAgent {
    /**
     * Analyze and recommend interventions
     */
    async analyze({ userId, checkinData, memory, emotionalInsight }) {
        const { level } = emotionalInsight;
        const { energy_level } = checkinData;

        // Get past outcomes to learn from
        const pastOutcomes = await this.getPastOutcomes(userId);

        // Get base interventions for this emotional level
        const baseInterventions = this.getBaseInterventions(level, energy_level);

        // Rank interventions based on past success
        const rankedInterventions = this.rankInterventions(baseInterventions, pastOutcomes);

        // Calculate confidence from past outcomes
        const confidence = this.calculateConfidenceFromOutcomes(pastOutcomes);

        // Select top 3 interventions
        const selectedInterventions = rankedInterventions.slice(0, 3);

        return {
            confidence,
            input: {
                level,
                energy_level,
                pastOutcomesCount: pastOutcomes.length
            },
            output: {
                recommendedInterventions: selectedInterventions
            },
            actions: selectedInterventions.map((intervention, index) => ({
                type: intervention.type,
                priority: index + 1,
                expectedDuration: intervention.duration,
                title: intervention.title,
                description: intervention.description
            })),
            reasoning: `Selected ${selectedInterventions.length} interventions for ${level} level with ${energy_level} energy. Confidence based on ${pastOutcomes.length} past outcomes. ${pastOutcomes.length > 0 ? 'Personalized based on your history.' : 'Using default recommendations.'}`
        };
    }

    /**
     * Get past outcomes for learning
     */
    async getPastOutcomes(userId) {
        const result = await db.query(
            `SELECT * FROM intervention_outcomes 
       WHERE user_id = $1 AND user_completed = true
       ORDER BY completed_at DESC 
       LIMIT 20`,
            [userId]
        );

        return result.rows;
    }

    /**
     * Get base interventions for emotional level
     */
    getBaseInterventions(level, energyLevel) {
        const interventions = {
            red: [
                { type: 'breathing_exercise', title: '4-7-8 Breathing', description: 'Calm your mind with guided breathing', duration: 10, priority: 1 },
                { type: 'grounding_technique', title: '5-4-3-2-1 Grounding', description: 'Ground yourself in the present moment', duration: 5, priority: 1 },
                { type: 'crisis_journaling', title: 'Express Your Feelings', description: 'Write down what you\'re experiencing', duration: 15, priority: 2 }
            ],
            orange: [
                { type: 'gentle_movement', title: 'Gentle Stretching', description: 'Release tension with light movement', duration: 10, priority: 1 },
                { type: 'creative_expression', title: 'Creative Doodling', description: 'Express yourself through art', duration: 15, priority: 1 },
                { type: 'gratitude_practice', title: 'Gratitude Reflection', description: 'Find small things to appreciate', duration: 10, priority: 2 }
            ],
            yellow: [
                { type: 'mindful_walk', title: 'Mindful Walk', description: 'Take a short walk with awareness', duration: 15, priority: 1 },
                { type: 'skill_practice', title: 'Learn Something New', description: 'Try a beginner skill module', duration: 15, priority: 1 },
                { type: 'social_connection', title: 'Connect with Someone', description: 'Reach out to a friend or family', duration: 20, priority: 2 }
            ],
            green: [
                { type: 'challenge_activity', title: 'Challenge Yourself', description: 'Try an advanced skill module', duration: 20, priority: 1 },
                { type: 'goal_setting', title: 'Set New Goals', description: 'Plan your next achievement', duration: 15, priority: 1 },
                { type: 'help_others', title: 'Help Someone', description: 'Share your positive energy', duration: 30, priority: 2 }
            ]
        };

        let selected = interventions[level] || interventions.yellow;

        // Adjust based on energy level
        if (energyLevel === 'low') {
            // Filter out high-duration activities
            selected = selected.filter(i => i.duration <= 15);
        }

        return selected;
    }

    /**
     * Rank interventions based on past success
     */
    rankInterventions(interventions, pastOutcomes) {
        if (pastOutcomes.length === 0) {
            // No history, return base priority
            return interventions.sort((a, b) => a.priority - b.priority);
        }

        // Calculate success rate for each intervention type
        const rankedInterventions = interventions.map(intervention => {
            const pastAttempts = pastOutcomes.filter(
                o => o.recommended_action === intervention.type
            );

            const successfulAttempts = pastAttempts.filter(
                o => o.outcome_rating >= 4
            );

            const successRate = pastAttempts.length > 0
                ? successfulAttempts.length / pastAttempts.length
                : 0.5; // Default 50% for untried interventions

            return {
                ...intervention,
                successRate,
                adjustedPriority: intervention.priority * (1 / (successRate + 0.1)) // Lower is better
            };
        });

        // Sort by adjusted priority
        return rankedInterventions.sort((a, b) => a.adjustedPriority - b.adjustedPriority);
    }

    /**
     * Calculate confidence from past outcomes
     */
    calculateConfidenceFromOutcomes(pastOutcomes) {
        if (pastOutcomes.length === 0) return 0.5; // Default confidence
        if (pastOutcomes.length < 5) return 0.6;
        if (pastOutcomes.length < 10) return 0.75;
        return 0.9; // High confidence with lots of data
    }
}

module.exports = AdaptiveInterventionAgent;
