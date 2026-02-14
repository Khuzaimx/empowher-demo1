const db = require('../../config/database');

/**
 * Course Recommendation Agent (Hackathon Demo)
 * Suggests learning resources based on emotional state and interests.
 */
class CourseRecommendationAgent {
    /**
     * Analyze and recommend courses
     * @param {Object} context - { userId, emotionalInsight, userProfile }
     * @returns {Promise<Object>} - Recommended course or null
     */
    async analyze({ userId, emotionalInsight, userProfile }) {
        try {
            console.log('[CourseRecommendationAgent] Analyzing learning needs...');
            const { level } = emotionalInsight; // 'distress', 'struggling', 'improving', 'thriving'
            const interests = userProfile.interests || [];

            // 1. Determine maximum difficulty based on emotional state
            // Crisis/Distress -> Low cognitive load (Micro-learning)
            // Thriving -> High cognitive load (Career skills)
            let maxDifficulty = 1;
            let categoryFocus = [];

            switch (level) {
                case 'crisis':
                case 'distress':
                    // Stage 4/3: Focus on stabilization, no complex learning
                    // Maybe just simple crafts or relaxation?
                    maxDifficulty = 1;
                    categoryFocus = ['Crafts', 'Wellbeing'];
                    break;
                case 'struggling':
                    // Stage 2ish: Beginner functional skills
                    maxDifficulty = 2;
                    categoryFocus = ['Crafts', 'Digital Literacy', 'Spoken English'];
                    break;
                case 'improving':
                case 'thriving':
                    // Stage 1: Career-oriented
                    maxDifficulty = 3;
                    categoryFocus = ['Freelancing', 'Digital Literacy', 'Business'];
                    break;
                default:
                    maxDifficulty = 1;
            }

            // 2. Fetch available courses matching criteria
            // In a real app, this would be a complex query. 
            // For demo, we just pick one that fits.

            // Get courses user has NOT completed
            const query = `
                SELECT c.* 
                FROM courses c
                LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = $1
                WHERE (uc.id IS NULL OR uc.completion_status != 'completed')
                AND c.difficulty_level <= $2
                ORDER BY c.difficulty_level DESC, RANDOM()
                LIMIT 1;
            `;

            // Note: We are keeping it simple for logic. 
            // Improvements: Filter by 'categoryFocus' if we had strict categories mapping.
            // For hackathon, just trusting the difficulty mapping is safer to ensure *some* result.

            const result = await db.query(query, [userId, maxDifficulty]);

            if (result.rows.length === 0) {
                return {
                    hasRecommendation: false,
                    message: "You're up to date on all recommended courses for now!"
                };
            }

            const course = result.rows[0];

            return {
                hasRecommendation: true,
                course: {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    duration: course.duration_estimate,
                    category: course.category,
                    url: course.source_url
                },
                reasoning: `Recommended because you are in '${level}' stage and ready for ${maxDifficulty === 3 ? 'advanced' : 'beginner'} learning.`
            };

        } catch (error) {
            console.error('[CourseRecommendationAgent] Error:', error);
            return { hasRecommendation: false, error: 'Failed to generate recommendation' };
        }
    }
}

module.exports = new CourseRecommendationAgent();
