const { classifyEmotionalLevel, getEncouragementMessage } = require('../../services/emotionalClassifier');

/**
 * Emotional Insight Agent (Priority 2)
 * Analyzes emotional state and identifies patterns from memory
 */
class EmotionalInsightAgent {
    /**
     * Analyze user's emotional state with trend analysis
     */
    async analyze({ userId, checkinData, memory }) {
        const { mood_score, stress_level, energy_level } = checkinData;

        // Classify emotional level using existing classifier
        const level = classifyEmotionalLevel(mood_score, stress_level);

        // Analyze trends from memory
        const trend = this.analyzeTrend(memory.shortTerm);

        // Determine if emotionally stable (for skill growth agent)
        const isStable = level === 'green' || level === 'yellow';

        // Calculate confidence based on data consistency
        const confidence = this.calculateConfidence(memory.shortTerm);

        // Generate insights
        const insights = this.generateInsights(mood_score, stress_level, energy_level, trend);

        // Get encouragement message
        const encouragement = getEncouragementMessage(level);

        return {
            level,
            isStable,
            confidence,
            input: {
                mood_score,
                stress_level,
                energy_level,
                historyLength: memory.shortTerm.length
            },
            output: {
                emotionalLevel: level,
                trend: trend.direction,
                trendStrength: trend.strength,
                trendChange: trend.change
            },
            insights,
            encouragement,
            reasoning: `Classified as ${level} based on mood=${mood_score}, stress=${stress_level}. 7-day trend: ${trend.direction} (${trend.description}). Confidence: ${(confidence * 100).toFixed(0)}%`
        };
    }

    /**
     * Analyze trend from short-term memory
     */
    analyzeTrend(shortTermMemory) {
        if (shortTermMemory.length < 3) {
            return {
                direction: 'insufficient_data',
                strength: 0,
                description: 'Building your history',
                change: 0
            };
        }

        // Get recent scores (last 7 entries)
        const recentScores = shortTermMemory.slice(0, 7).map(e => e.mood_score);
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

        // Get previous scores (entries 8-14)
        const previousScores = shortTermMemory.slice(7, 14).map(e => e.mood_score);

        if (previousScores.length === 0) {
            return {
                direction: 'insufficient_data',
                strength: 0,
                description: 'Building your history',
                change: 0
            };
        }

        const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
        const change = recentAvg - previousAvg;

        let direction, description;

        if (change > 1) {
            direction = 'improving';
            description = 'Your mood is improving! 📈';
        } else if (change < -1) {
            direction = 'declining';
            description = 'Your mood needs attention 💙';
        } else {
            direction = 'stable';
            description = 'Your mood is stable';
        }

        return {
            direction,
            strength: Math.abs(change),
            description,
            change: change.toFixed(2)
        };
    }

    /**
     * Calculate confidence based on data consistency
     */
    calculateConfidence(shortTermMemory) {
        if (shortTermMemory.length === 0) return 0.3;
        if (shortTermMemory.length < 3) return 0.5;
        if (shortTermMemory.length < 5) return 0.7;
        return 0.9; // High confidence with 5+ data points
    }

    /**
     * Generate insights based on current state
     */
    generateInsights(moodScore, stressLevel, energyLevel, trend) {
        const insights = [];

        // Mood description
        const moodDesc = this.getMoodDescription(moodScore);
        insights.push(`Your mood is ${moodDesc}`);

        // Trend insight
        if (trend.direction !== 'insufficient_data') {
            insights.push(trend.description);

            if (trend.direction === 'improving') {
                insights.push('Keep up the great work! 🌟');
            } else if (trend.direction === 'declining') {
                insights.push("Let's work on this together");
            }
        }

        // Stress insight
        if (stressLevel === 'high') {
            insights.push('High stress detected - consider relaxation activities');
        }

        // Energy insight
        if (energyLevel === 'low' && moodScore <= 5) {
            insights.push('Low energy + low mood - prioritize self-care');
        } else if (energyLevel === 'high' && moodScore >= 7) {
            insights.push('Great energy! Perfect time for growth activities');
        }

        return insights;
    }

    /**
     * Get mood description
     */
    getMoodDescription(score) {
        if (score <= 2) return 'very low 😢';
        if (score <= 4) return 'low 😔';
        if (score <= 6) return 'moderate 😐';
        if (score <= 8) return 'good 😊';
        return 'excellent 🤩';
    }
}

module.exports = EmotionalInsightAgent;
