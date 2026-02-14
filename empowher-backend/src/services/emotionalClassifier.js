/**
 * Emotional Risk Classification Engine
 * Rule-based system to classify user's emotional state
 */

/**
 * Classify emotional level based on mood score and stress level
 * @param {number} moodScore - Mood score from 1-10
 * @param {string} stressLevel - 'low', 'medium', or 'high'
 * @returns {string} - 'red', 'orange', 'yellow', or 'green'
 */
function classifyEmotionalLevel(moodScore, stressLevel) {
    // Level Red: Critical - requires immediate crisis support
    if (moodScore <= 3 && stressLevel === 'high') {
        return 'red';
    }

    // Level Orange: Concerning - needs supportive activities
    if (moodScore <= 4) {
        return 'orange';
    }

    // Level Yellow: Moderate - gentle encouragement
    if (moodScore >= 5 && moodScore <= 6) {
        return 'yellow';
    }

    // Level Green: Positive - ready for growth
    return 'green';
}

/**
 * Get supportive message based on emotional level
 * @param {string} level - Emotional level
 * @returns {string} - Encouraging message
 */
function getEncouragementMessage(level) {
    const messages = {
        red: "We're here for you. Please reach out to someone who can help. You don't have to go through this alone.",
        orange: "It's okay to have difficult days. Let's take small steps together to help you feel better.",
        yellow: "You're doing well. Let's build on this positive momentum with some gentle activities.",
        green: "You're in a great place! This is a perfect time to challenge yourself and grow."
    };

    return messages[level] || messages.yellow;
}

/**
 * Determine if crisis protocol should be triggered
 * @param {string} level - Emotional level
 * @returns {boolean} - Whether to show crisis support
 */
function shouldTriggerCrisisProtocol(level) {
    return level === 'red';
}

module.exports = {
    classifyEmotionalLevel,
    getEncouragementMessage,
    shouldTriggerCrisisProtocol
};
