/**
 * Skill Recommendation Engine
 * Recommends appropriate skill modules based on emotional state, energy, and interests
 */

/**
 * Get skill recommendations based on user's current state
 * @param {string} emotionalLevel - 'red', 'orange', 'yellow', or 'green'
 * @param {string} energyLevel - 'low', 'medium', or 'high'
 * @param {Array<string>} interests - User's selected interests
 * @param {Array<object>} availableSkills - All available skill modules
 * @returns {Array<object>} - Recommended skill modules
 */
function recommendSkills(emotionalLevel, energyLevel, interests = [], availableSkills = []) {
    let recommendedCategories = [];
    let maxDuration = 15;
    let difficulty = 'beginner';

    // Determine appropriate categories and constraints based on emotional level
    switch (emotionalLevel) {
        case 'red':
            // Low-pressure grounding activities only
            recommendedCategories = ['wellness'];
            maxDuration = 10;
            difficulty = 'beginner';
            break;

        case 'orange':
            // Short creative and wellness activities
            recommendedCategories = ['wellness', 'creative'];
            maxDuration = 15;
            difficulty = 'beginner';
            break;

        case 'yellow':
            // Structured learning based on interests
            if (interests.length > 0) {
                recommendedCategories = interests.filter(i =>
                    ['coding', 'language', 'creative', 'business', 'wellness'].includes(i)
                );
            } else {
                recommendedCategories = ['coding', 'creative', 'wellness'];
            }
            maxDuration = 15;
            difficulty = energyLevel === 'high' ? 'intermediate' : 'beginner';
            break;

        case 'green':
            // Advanced modules based on interests and energy
            if (interests.length > 0) {
                recommendedCategories = interests;
            } else {
                recommendedCategories = ['coding', 'creative', 'business', 'language'];
            }
            maxDuration = energyLevel === 'high' ? 30 : 15;
            difficulty = energyLevel === 'high' ? 'advanced' : 'intermediate';
            break;
    }

    // Filter skills based on criteria
    const filtered = availableSkills.filter(skill => {
        const categoryMatch = recommendedCategories.includes(skill.category);
        const durationMatch = skill.duration_minutes <= maxDuration;
        const difficultyMatch = getDifficultyLevel(skill.difficulty) <= getDifficultyLevel(difficulty);

        return categoryMatch && durationMatch && difficultyMatch;
    });

    // Sort by relevance (matching interests first, then by points)
    const sorted = filtered.sort((a, b) => {
        const aInterestMatch = interests.includes(a.category) ? 1 : 0;
        const bInterestMatch = interests.includes(b.category) ? 1 : 0;

        if (aInterestMatch !== bInterestMatch) {
            return bInterestMatch - aInterestMatch;
        }

        return b.points_reward - a.points_reward;
    });

    // Return top 3-5 recommendations
    return sorted.slice(0, 5);
}

/**
 * Convert difficulty string to numeric level for comparison
 * @param {string} difficulty
 * @returns {number}
 */
function getDifficultyLevel(difficulty) {
    const levels = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3
    };
    return levels[difficulty] || 1;
}

/**
 * Get activity type recommendation based on emotional level
 * @param {string} emotionalLevel
 * @returns {string}
 */
function getActivityType(emotionalLevel) {
    const types = {
        red: 'grounding',
        orange: 'creative',
        yellow: 'learning',
        green: 'challenging'
    };
    return types[emotionalLevel] || 'learning';
}

module.exports = {
    recommendSkills,
    getActivityType,
    getDifficultyLevel
};
