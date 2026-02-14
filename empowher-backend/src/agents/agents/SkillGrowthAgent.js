const db = require('../../config/database');

/**
 * Skill Growth Agent (Priority 4)
 * Recommends skill modules only when user is emotionally stable
 */
class SkillGrowthAgent {
    /**
     * Analyze and recommend skills
     */
    async analyze({ userId, checkinData, memory, emotionalInsight }) {
        // Only activate if user is emotionally stable
        if (!emotionalInsight.isStable) {
            return {
                shouldActivate: false,
                confidence: 0,
                input: {
                    emotionalLevel: emotionalInsight.level,
                    isStable: false
                },
                output: {},
                recommendations: [],
                reasoning: `User not emotionally stable (${emotionalInsight.level} level). Focusing on emotional wellness first.`
            };
        }

        const { interests = [] } = checkinData;
        const { energy_level } = checkinData;

        // Get user's skill history
        const skillHistory = await this.getSkillHistory(userId);

        // Analyze preferences from history
        const preferredCategories = this.analyzePreferences(skillHistory, interests);

        // Get personalized skill recommendations
        const recommendations = await this.getPersonalizedSkills(
            userId,
            preferredCategories,
            energy_level,
            skillHistory
        );

        // Calculate confidence based on data
        const confidence = this.calculateConfidence(skillHistory);

        return {
            shouldActivate: true,
            confidence,
            input: {
                interests,
                energy_level,
                completedSkills: skillHistory.filter(s => s.completed).length,
                totalSkillsStarted: skillHistory.length
            },
            output: {
                recommendations: recommendations.slice(0, 5).map(r => ({
                    id: r.id,
                    title: r.title,
                    category: r.category,
                    difficulty: r.difficulty,
                    duration: r.duration_minutes
                }))
            },
            recommendations: recommendations.slice(0, 5),
            reasoning: `User is stable (${emotionalInsight.level} level) with ${energy_level} energy. Recommended ${recommendations.length} skills based on ${preferredCategories.join(', ')} interests. Completed ${skillHistory.filter(s => s.completed).length} skills previously.`
        };
    }

    /**
     * Get user's skill history
     */
    async getSkillHistory(userId) {
        const result = await db.query(
            `SELECT usp.*, sm.title, sm.category, sm.difficulty, sm.duration_minutes
       FROM user_skill_progress usp
       JOIN skill_modules sm ON usp.skill_id = sm.id
       WHERE usp.user_id = $1
       ORDER BY usp.started_at DESC`,
            [userId]
        );

        return result.rows;
    }

    /**
     * Analyze user preferences from history
     */
    analyzePreferences(skillHistory, interests) {
        // Start with user-declared interests
        const categories = new Set(interests);

        // Add categories from completed skills (weighted higher)
        skillHistory
            .filter(s => s.completed)
            .forEach(s => categories.add(s.category));

        // If no preferences, use defaults
        if (categories.size === 0) {
            return ['wellness', 'creative', 'coding'];
        }

        return Array.from(categories);
    }

    /**
     * Analyze user preferences from history
     */
    async selectSkills(emotionalInsight, userProfile, context) {
        // Query database for all available skill modules
        // In a real app, this would be a DB query. Mocking for now.
        const allSkills = [
            { id: 'breathing_basics', title: 'Breathing Basics', category: 'coping', difficulty: 'beginner', tags: ['anxiety', 'stress'], min_stage: 'distress' },
            { id: 'identifying_emotions', title: 'Naming Your Feelings', category: 'emotional_intelligence', difficulty: 'beginner', tags: ['mood', 'awareness'], min_stage: 'struggling' },
            { id: 'communication_101', title: 'Speaking Up', category: 'communication', difficulty: 'intermediate', tags: ['relationships'], min_stage: 'stabilizing' },
            { id: 'assertiveness', title: 'Saying No', category: 'communication', difficulty: 'intermediate', tags: ['boundaries'], min_stage: 'stabilizing' },
            { id: 'goal_setting', title: 'Setting Small Goals', category: 'growth', difficulty: 'intermediate', tags: ['motivation'], min_stage: 'stabilizing' },
            { id: 'community_building', title: 'Building Your Circle', category: 'social', difficulty: 'advanced', tags: ['connection'], min_stage: 'thriving' },
            { id: 'leadership_basics', title: 'Leading Others', category: 'growth', difficulty: 'advanced', tags: ['leadership'], min_stage: 'thriving' }
        ];

        const stage = context.memory?.emotionalStage || 'unknown';
        const { phq2Score, gad2Score } = emotionalInsight.output;

        // Filter skills based on emotional state and stage
        return allSkills.filter(skill => {
            // 1. Safety Filter: No advanced skills if in crisis/distress
            if ((stage === 'distress' || stage === 'struggling') && skill.difficulty === 'advanced') {
                return false;
            }

            // 2. Stage Match
            if (stage === 'distress' && skill.min_stage !== 'distress') return false;
            if (stage === 'struggling' && (skill.min_stage === 'thriving' || skill.min_stage === 'stabilizing')) return false;

            // 3. Symptom Match (Bonus)
            if (gad2Score >= 3 && skill.tags.includes('anxiety')) return true;
            if (phq2Score >= 3 && skill.tags.includes('mood')) return true;

            return true;
        });
    }
    /**
     * Get personalized skill recommendations
     */
    async getPersonalizedSkills(userId, preferredCategories, energyLevel, skillHistory) {
        // Get completed skill IDs to exclude
        const completedIds = skillHistory
            .filter(s => s.completed)
            .map(s => s.skill_id);

        // Determine difficulty based on history
        let difficulty = 'beginner';
        const completedCount = completedIds.length;

        if (completedCount >= 5) {
            difficulty = 'intermediate';
        }
        if (completedCount >= 10) {
            difficulty = 'advanced';
        }

        // Determine max duration based on energy
        const maxDuration = energyLevel === 'high' ? 30 : energyLevel === 'medium' ? 20 : 15;

        // Build query
        let query = `
      SELECT * FROM skill_modules 
      WHERE duration_minutes <= $1
    `;
        const params = [maxDuration];

        // Filter by categories if specified
        if (preferredCategories.length > 0) {
            query += ` AND category = ANY($2)`;
            params.push(preferredCategories);
        }

        // Exclude completed skills
        if (completedIds.length > 0) {
            query += ` AND id != ALL($${params.length + 1})`;
            params.push(completedIds);
        }

        query += ` ORDER BY 
      CASE 
        WHEN difficulty = $${params.length + 1} THEN 1
        ELSE 2
      END,
      points_reward DESC
      LIMIT 10`;
        params.push(difficulty);

        const result = await db.query(query, params);

        return result.rows;
    }

    /**
     * Calculate confidence based on skill history
     */
    calculateConfidence(skillHistory) {
        if (skillHistory.length === 0) return 0.5;
        if (skillHistory.length < 3) return 0.6;
        if (skillHistory.length < 5) return 0.75;
        return 0.9;
    }
}

module.exports = SkillGrowthAgent;
