const db = require('../../config/database');

/**
 * Memory Manager
 * Manages short-term and long-term memory for users
 */
class MemoryManager {
    /**
     * Get user memory (creates if doesn't exist)
     */
    async getUserMemory(userId) {
        // Get user memory record
        let memoryResult = await db.query(
            'SELECT * FROM user_memory WHERE user_id = $1',
            [userId]
        );

        let memory = memoryResult.rows[0];

        if (!memory) {
            // Create if doesn't exist (should be auto-created by trigger, but just in case)
            memory = await this.createUserMemory(userId);
        }

        // Load short-term memory (last 7 days of emotional entries)
        const shortTermResult = await db.query(
            `SELECT * FROM emotional_entries 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC`,
            [userId]
        );

        return {
            id: memory.id,
            userId: memory.user_id,
            shortTerm: shortTermResult.rows,
            longTerm: memory.long_term_summary || {},
            emotionalStage: memory.long_term_summary?.existingStage || 'unknown',
            trendDirection: memory.trend_direction,
            engagementScore: memory.engagement_score,
            lastUpdated: memory.last_updated
        };
    }

    /**
     * Create user memory record
     */
    async createUserMemory(userId) {
        const result = await db.query(
            `INSERT INTO user_memory (user_id) 
       VALUES ($1) 
       RETURNING *`,
            [userId]
        );
        return result.rows[0];
    }

    /**
     * Update short-term memory summary
     */
    async updateShortTermMemory(userId, checkinData) {
        // Short-term memory is automatically maintained by emotional_entries table
        // This can be used for additional processing if needed
        return true;
    }

    /**
     * Update long-term trends based on historical data
     */
    async updateLongTermTrends(userId) {
        // Get last 30 days of data
        const historyResult = await db.query(
            `SELECT * FROM emotional_entries 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
       ORDER BY created_at ASC`,
            [userId]
        );

        const history = historyResult.rows;

        if (history.length === 0) {
            return;
        }

        // Calculate trend
        const trend = this.calculateTrendDirection(history);

        // Calculate engagement score
        const engagement = await this.calculateEngagementScore(userId);

        // Update user memory
        await db.query(
            `UPDATE user_memory 
       SET long_term_summary = $1, 
           trend_direction = $2, 
           engagement_score = $3, 
           last_updated = NOW()
       WHERE user_id = $4`,
            [
                JSON.stringify({
                    avgMood: trend.avgMood,
                    existingStage: this.calculateEmotionalStage(history),
                    consistency: trend.consistency,
                    totalCheckins: history.length,
                    lastCheckin: history[history.length - 1].created_at
                }),
                trend.direction,
                engagement,
                userId
            ]
        );
    }

    /**
     * Calculate trend direction from historical data
     */
    calculateTrendDirection(history) {
        if (history.length < 3) {
            return {
                direction: 'insufficient_data',
                avgMood: 0,
                consistency: 0
            };
        }

        // Calculate average mood
        const avgMood = history.reduce((sum, entry) => sum + entry.mood_score, 0) / history.length;

        // Compare recent vs older data
        const recentData = history.slice(-7);
        const olderData = history.slice(0, Math.min(7, history.length - 7));

        if (olderData.length === 0) {
            return {
                direction: 'insufficient_data',
                avgMood: avgMood.toFixed(2),
                consistency: this.calculateConsistency(history)
            };
        }

        const recentAvg = recentData.reduce((sum, e) => sum + (e.who5_total_score || e.mood_score * 10), 0) / recentData.length;
        const olderAvg = olderData.reduce((sum, e) => sum + (e.who5_total_score || e.mood_score * 10), 0) / olderData.length;

        const change = recentAvg - olderAvg;

        let direction;
        if (change > 5) { // Significant improvement in WHO-5 (0-100 scale)
            direction = 'improving';
        } else if (change < -5) {
            direction = 'declining';
        } else {
            direction = 'stable';
        }

        return {
            direction,
            avgMood: (avgMood * 10).toFixed(1), // Normalized to 0-100
            consistency: this.calculateConsistency(history),
            change: change.toFixed(2)
        };
    }

    /**
     * Calculate emotional stage based on recent history
     */
    calculateEmotionalStage(history) {
        if (!history || history.length === 0) return 'unknown';

        const recent = history.slice(-5); // Last 5 entries

        // Calculate averages
        const avgPhq2 = recent.reduce((sum, e) => sum + (e.phq2_total_score || 0), 0) / recent.length;
        const avgGad2 = recent.reduce((sum, e) => sum + (e.gad2_total_score || 0), 0) / recent.length;
        const avgWho5 = recent.reduce((sum, e) => sum + (e.who5_total_score || (e.mood_score * 10)), 0) / recent.length;

        // Determine stage
        if (avgPhq2 >= 3 || avgGad2 >= 3 || avgWho5 < 28) {
            return 'distress';
        } else if (avgWho5 < 50) {
            return 'struggling';
        } else if (avgWho5 >= 50 && avgWho5 < 70) {
            return 'stabilizing';
        } else {
            return 'thriving';
        }
    }

    /**
     * Calculate consistency score (how regular are check-ins)
     */
    calculateConsistency(history) {
        if (history.length < 2) return 0;

        // Calculate average days between check-ins
        const intervals = [];
        for (let i = 1; i < history.length; i++) {
            const diff = new Date(history[i].created_at) - new Date(history[i - 1].created_at);
            const days = diff / (1000 * 60 * 60 * 24);
            intervals.push(days);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        // Score: 100 for daily check-ins, decreasing as interval increases
        const score = Math.max(0, Math.min(100, 100 - (avgInterval - 1) * 20));

        return Math.round(score);
    }

    /**
     * Calculate engagement score based on activity
     */
    async calculateEngagementScore(userId) {
        // Get check-in count (last 30 days)
        const checkinResult = await db.query(
            `SELECT COUNT(*) as count FROM emotional_entries 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`,
            [userId]
        );
        const checkinCount = parseInt(checkinResult.rows[0].count);

        // Get completed skills (last 30 days)
        const skillResult = await db.query(
            `SELECT COUNT(*) as count FROM user_skill_progress 
       WHERE user_id = $1 AND completed = true 
       AND completed_at >= NOW() - INTERVAL '30 days'`,
            [userId]
        );
        const skillCount = parseInt(skillResult.rows[0].count);

        // Calculate score
        // Check-ins: up to 60 points (2 points per check-in, max 30 check-ins)
        // Skills: up to 40 points (4 points per skill, max 10 skills)
        const checkinScore = Math.min(60, checkinCount * 2);
        const skillScore = Math.min(40, skillCount * 4);

        return checkinScore + skillScore;
    }
}

module.exports = MemoryManager;
