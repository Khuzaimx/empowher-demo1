const { simplifyLanguage } = require('../../services/aiService');

/**
 * Ethics Guard Agent (Priority 3.5 - Between Intervention and Skill)
 * Reviews interventions and content for:
 * - Cultural sensitivity (rural Pakistani context)
 * - Cognitive demand appropriateness
 * - Emotional overload risk
 * - Language accessibility
 * 
 * Can downgrade or modify interventions to ensure ethical delivery
 */
class EthicsGuardAgent {
    /**
     * Review and adjust interventions for ethical delivery
     * @param {Object} context - { userId, interventions, emotionalInsight, userProfile }
     * @returns {Promise<Object>} - Agent decision with ethical adjustments
     */
    async analyze({ userId, interventions, emotionalInsight, userProfile = {} }) {
        const { level } = emotionalInsight;
        const { education_level, preferred_language, location_type, internet_stability } = userProfile;

        const reviewedInterventions = [];
        const adjustments = [];

        for (const intervention of interventions) {
            const review = await this.reviewIntervention(
                intervention,
                level,
                education_level,
                preferred_language,
                location_type,
                internet_stability
            );

            if (review.approved) {
                reviewedInterventions.push(review.intervention);
            }

            if (review.adjustmentMade) {
                adjustments.push({
                    interventionType: intervention.type,
                    reason: review.adjustmentReason,
                    action: review.adjustmentAction
                });
            }
        }

        const confidence = 0.95; // High confidence in ethical rules

        return {
            confidence,
            input: {
                interventionCount: interventions.length,
                emotionalTier: level,
                educationLevel: education_level,
                language: preferred_language
            },
            output: {
                approvedInterventions: reviewedInterventions,
                adjustmentsMade: adjustments.length,
                adjustments
            },
            actions: reviewedInterventions,
            reasoning: `Reviewed ${interventions.length} interventions for ethical delivery. Made ${adjustments.length} adjustments for cultural sensitivity, cognitive load, and accessibility. User tier: ${level}, education: ${education_level || 'unknown'}.`
        };
    }

    /**
     * Review a single intervention for ethical concerns
     */
    async reviewIntervention(intervention, tier, educationLevel, language, locationType, internetStability) {
        let approved = true;
        let adjustmentMade = false;
        let adjustmentReason = '';
        let adjustmentAction = '';
        let modifiedIntervention = { ...intervention };

        // RULE 1: Red tier - Only breathing and grounding exercises
        if (tier === 'red') {
            const allowedTypes = ['guided_breathing', 'grounding_technique'];
            if (!allowedTypes.includes(intervention.type)) {
                approved = false;
                adjustmentMade = true;
                adjustmentReason = 'User in crisis state - only immediate calming techniques allowed';
                adjustmentAction = 'Filtered out non-crisis intervention';
                return { approved, adjustmentMade, adjustmentReason, adjustmentAction, intervention: modifiedIntervention };
            }
        }

        // RULE 2: Orange tier - Only low cognitive load
        if (tier === 'orange' && intervention.cognitiveLoad !== 'low') {
            modifiedIntervention.cognitiveLoad = 'low';
            modifiedIntervention.duration = Math.min(modifiedIntervention.duration, 10);
            adjustmentMade = true;
            adjustmentReason = 'User in distress - reduced cognitive demand';
            adjustmentAction = 'Reduced duration and complexity';
        }

        // RULE 3: Low education - Simplify all descriptions
        if (educationLevel === 'none' || educationLevel === 'primary') {
            if (intervention.cognitiveLoad === 'high') {
                approved = false;
                adjustmentMade = true;
                adjustmentReason = 'Intervention too complex for education level';
                adjustmentAction = 'Filtered out high-complexity intervention';
                return { approved, adjustmentMade, adjustmentReason, adjustmentAction, intervention: modifiedIntervention };
            }

            // Simplify description further
            const simplified = await simplifyLanguage(
                intervention.description,
                language || 'en',
                educationLevel
            );
            modifiedIntervention.description = simplified;
            adjustmentMade = true;
            adjustmentReason = 'Simplified language for education level';
            adjustmentAction = 'Applied AI language simplification';
        }

        // RULE 4: Low internet stability - Filter online-only interventions
        if (internetStability === 'low') {
            const onlineOnlyTypes = ['video_tutorial', 'online_course', 'live_session'];
            if (onlineOnlyTypes.includes(intervention.type)) {
                approved = false;
                adjustmentMade = true;
                adjustmentReason = 'Requires stable internet connection';
                adjustmentAction = 'Filtered out online-only intervention';
                return { approved, adjustmentMade, adjustmentReason, adjustmentAction, intervention: modifiedIntervention };
            }
        }

        // RULE 5: Cultural sensitivity check for rural Pakistan
        const culturalCheck = this.checkCulturalSensitivity(intervention, locationType);
        if (!culturalCheck.appropriate) {
            approved = false;
            adjustmentMade = true;
            adjustmentReason = culturalCheck.reason;
            adjustmentAction = 'Filtered for cultural inappropriateness';
            return { approved, adjustmentMade, adjustmentReason, adjustmentAction, intervention: modifiedIntervention };
        }

        // RULE 6: Avoid medical/clinical language
        const hasMedicalLanguage = this.containsMedicalLanguage(intervention.description);
        if (hasMedicalLanguage) {
            const nonMedical = this.removeMedicalLanguage(intervention.description);
            modifiedIntervention.description = nonMedical;
            adjustmentMade = true;
            adjustmentReason = 'Removed medical/clinical terminology';
            adjustmentAction = 'Replaced with wellness language';
        }

        return {
            approved,
            adjustmentMade,
            adjustmentReason,
            adjustmentAction,
            intervention: modifiedIntervention
        };
    }

    /**
     * Check cultural sensitivity for rural Pakistani context
     */
    checkCulturalSensitivity(intervention, locationType) {
        // Examples of culturally inappropriate interventions
        const inappropriateKeywords = [
            'alcohol', 'bar', 'club', 'dating',
            'meditation retreat', 'yoga studio'
        ];

        const description = intervention.description.toLowerCase();
        for (const keyword of inappropriateKeywords) {
            if (description.includes(keyword)) {
                return {
                    appropriate: false,
                    reason: `Contains culturally inappropriate content: ${keyword}`
                };
            }
        }

        // Check for gender-specific concerns for rural areas
        if (locationType === 'rural') {
            const concerningKeywords = ['public speaking', 'group meeting', 'outdoor activity alone'];
            for (const keyword of concerningKeywords) {
                if (description.includes(keyword)) {
                    // Flag but don't reject - just note
                    console.log(`[EthicsGuard] Cultural concern flagged: ${keyword} in rural context`);
                }
            }
        }

        return { appropriate: true };
    }

    /**
     * Check if description contains medical/clinical language
     */
    containsMedicalLanguage(text) {
        const medicalTerms = [
            'diagnosis', 'disorder', 'syndrome', 'pathology',
            'clinical', 'psychiatric', 'therapeutic intervention',
            'treatment', 'medication', 'prescription'
        ];

        const lowerText = text.toLowerCase();
        return medicalTerms.some(term => lowerText.includes(term));
    }

    /**
     * Remove medical language and replace with wellness language
     */
    removeMedicalLanguage(text) {
        const replacements = {
            'diagnosis': 'understanding',
            'disorder': 'challenge',
            'syndrome': 'pattern',
            'clinical': 'helpful',
            'psychiatric': 'emotional',
            'therapeutic intervention': 'helpful activity',
            'treatment': 'support',
            'medication': 'help',
            'prescription': 'recommendation'
        };

        let cleaned = text;
        for (const [medical, wellness] of Object.entries(replacements)) {
            const regex = new RegExp(medical, 'gi');
            cleaned = cleaned.replace(regex, wellness);
        }

        return cleaned;
    }

    /**
     * Generate ethical disclaimer for crisis situations
     */
    generateEthicalDisclaimer(tier) {
        const disclaimers = {
            red: "This platform provides wellness guidance and educational support only. It is not a substitute for professional medical or mental health care. If you are in crisis, please contact emergency services or a crisis helpline.",
            orange: "Remember: This is educational support, not professional medical advice. If you need urgent help, please reach out to a healthcare provider.",
            yellow: "This platform offers wellness guidance to support your journey. For medical concerns, please consult a healthcare professional.",
            green: "Keep growing! This platform provides educational support for your wellbeing journey."
        };

        return disclaimers[tier] || disclaimers.yellow;
    }
}

module.exports = EthicsGuardAgent;
