/**
 * Crisis Protocol Service
 * Handles crisis detection and support resource delivery
 */

/**
 * Get crisis support message
 * @returns {object} - Crisis support information
 */
function getCrisisSupportMessage() {
    return {
        title: "We're Here For You",
        message: "It sounds like you're going through a really difficult time right now. Please know that you don't have to face this alone.",
        disclaimer: "This platform provides wellness guidance only and is not a substitute for professional mental health care.",
        urgentNote: "If you're in immediate danger, please call emergency services (911) or go to your nearest emergency room."
    };
}

/**
 * Format helpline data for crisis response
 * @param {Array<object>} helplines - Array of helpline objects from database
 * @returns {Array<object>} - Formatted helplines
 */
function formatHelplines(helplines) {
    return helplines.map(helpline => ({
        id: helpline.id,
        name: helpline.name,
        phoneNumber: helpline.phone_number,
        description: helpline.description,
        region: helpline.region
    }));
}

/**
 * Get default helplines if none configured
 * @returns {Array<object>} - Default crisis helplines
 */
function getDefaultHelplines() {
    return [
        {
            name: "National Suicide Prevention Lifeline (US)",
            phoneNumber: "988",
            description: "24/7 free and confidential support",
            region: "United States"
        },
        {
            name: "Crisis Text Line",
            phoneNumber: "Text HOME to 741741",
            description: "24/7 text-based crisis support",
            region: "United States"
        },
        {
            name: "International Association for Suicide Prevention",
            phoneNumber: "Visit iasp.info/resources",
            description: "Find helplines worldwide",
            region: "International"
        }
    ];
}

/**
 * Build complete crisis response
 * @param {Array<object>} helplines - Available helplines
 * @returns {object} - Complete crisis response
 */
function buildCrisisResponse(helplines = []) {
    const supportMessage = getCrisisSupportMessage();
    const formattedHelplines = helplines.length > 0
        ? formatHelplines(helplines)
        : getDefaultHelplines();

    return {
        ...supportMessage,
        helplines: formattedHelplines,
        showVolunteerChat: true, // Mock feature
        volunteerChatNote: "Volunteer chat is coming soon. Please use the helplines above for immediate support."
    };
}

module.exports = {
    getCrisisSupportMessage,
    formatHelplines,
    getDefaultHelplines,
    buildCrisisResponse
};
