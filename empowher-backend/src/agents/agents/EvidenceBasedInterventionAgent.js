const db = require('../../config/database');
const { simplifyLanguage } = require('../../services/aiService');

/**
 * Evidence-Based Intervention Agent (Priority 3)
 * Recommends interventions based on research evidence and personal success history
 * 
 * Evidence-backed interventions:
 * - Behavioral Activation (for depression)
 * - Cognitive Reframing (for anxiety)
 * - Expressive Writing (for low wellbeing)
 * - Guided Breathing (4-7-8 method for anxiety)
 * - Gratitude Reflection (for low wellbeing)
 */
class EvidenceBasedInterventionAgent {
    /**
     * Analyze and recommend evidence-based interventions
     * @param {Object} context - { userId, checkinData, memory, emotionalInsight, userProfile }
     * @returns {Promise<Object>} - Agent decision with ranked interventions
     */
    async analyze({ userId, checkinData, memory, emotionalInsight, userProfile = {} }) {
        const { level, output: emotionalOutput } = emotionalInsight;
        const { phq2Score, gad2Score, who5Score } = emotionalOutput;

        // Get past outcomes to learn from
        const pastOutcomes = await this.getPastOutcomes(userId);

        // Select appropriate interventions based on scores and context
        const recommendedInterventions = await this.selectInterventions(
            phq2Score,
            gad2Score,
            who5Score,
            emotionalInsight,
            { userId, checkinData, memory, emotionalInsight, userProfile } // Pass the entire context object
        );

        // Rank interventions based on personal success
        const rankedInterventions = this.rankByPersonalSuccess(recommendedInterventions, pastOutcomes);

        // Adjust for cognitive load based on emotional state
        const adjustedInterventions = this.adjustForCognitiveLoad(rankedInterventions, level, userProfile);

        // Calculate confidence from past outcomes
        const confidence = this.calculateConfidenceFromOutcomes(pastOutcomes);

        // Select top 3 interventions
        const selectedInterventions = adjustedInterventions.slice(0, 3);

        // Simplify descriptions for user
        const language = userProfile.preferred_language || 'en';
        const educationLevel = userProfile.education_level || 'primary';
        const simplifiedInterventions = await this.simplifyInterventionDescriptions(
            selectedInterventions,
            language,
            educationLevel
        );

        return {
            confidence,
            input: {
                level,
                phq2Score,
                gad2Score,
                who5Score,
                pastOutcomesCount: pastOutcomes.length
            },
            output: {
                recommendedInterventions: simplifiedInterventions.map(i => ({
                    type: i.type,
                    title: i.title,
                    description: i.description,
                    evidenceBase: i.evidenceBase,
                    cognitiveLoad: i.cognitiveLoad
                }))
            },
            actions: simplifiedInterventions.map((intervention, index) => ({
                type: intervention.type,
                priority: index + 1,
                expectedDuration: intervention.duration,
                title: intervention.title,
                description: intervention.description,
                cognitiveLoad: intervention.cognitiveLoad
            })),
            reasoning: `Selected ${simplifiedInterventions.length} evidence-based interventions for ${level} tier (PHQ-2=${phq2Score}, GAD-2=${gad2Score}, WHO-5=${who5Score}). Ranked by personal success history (${pastOutcomes.length} past outcomes). Adjusted for cognitive load.`
        };
    }

    /**
     * Get evidence-based interventions based on research scores
     * @param {number} phq2 - PHQ-2 score
     * @param {number} gad2 - GAD-2 score
     * @param {number} who5 - WHO-5 score
     * @param {Object} emotionalInsight - Full emotional insight object
     * @param {Object} context - { memory, userProfile }
     * @returns {Array} - Array of intervention objects
     */
    async selectInterventions(phq2, gad2, who5, emotionalInsight, context) {
        const interventions = [];
        const stage = context.memory?.emotionalStage || 'unknown';
        const trend = context.memory?.trendDirection || 'stable';
        const { level: tier } = emotionalInsight; // Extract tier from emotionalInsight
        const { userProfile } = context; // Extract userProfile from context

        // 1. STAGE-BASED PRIORITIZATION
        if (stage === 'distress' || stage === 'struggling') {
            // Prioritize grounding and immediate relief
            interventions.push({
                type: 'grounding',
                title: '5-4-3-2-1 Grounding Technique',
                description: 'A simple exercise to help you feel calmer and more present.',
                evidenceBase: 'Grounding for acute distress',
                duration: 5,
                cognitiveLoad: 'low',
                priority: 1,
                reason: `Recommended for ${stage} stage to provide immediate stability.`
            });

            if (gad2 >= 3) {
                interventions.push({
                    type: 'breathing',
                    title: 'Box Breathing',
                    description: 'Slow, rhythmic breathing to reduce anxiety.',
                    evidenceBase: 'Breathing exercises for anxiety reduction',
                    duration: 5,
                    cognitiveLoad: 'low',
                    priority: 1,
                    reason: 'Effective for high anxiety symptoms.'
                });
            }
        } else if (stage === 'stabilizing') {
            // Focus on routine and maintenance
            interventions.push({
                type: 'behavioral_activation',
                title: 'Pleasant Activity Scheduling',
                description: 'Planning one small, enjoyable activity for tomorrow.',
                evidenceBase: 'Behavioral activation for depression',
                duration: 15,
                cognitiveLoad: 'medium',
                priority: 2,
                reason: 'Helps maintain momentum during stabilization.'
            });
        } else if (stage === 'thriving') {
            // Focus on growth and values
            interventions.push({
                type: 'values_work',
                title: 'Values Reflection',
                description: 'Reflecting on what matters most to you.',
                evidenceBase: 'Values-based living for wellbeing',
                duration: 10,
                cognitiveLoad: 'medium',
                priority: 3,
                reason: 'Appropriate for thriving stage to deepen purpose.'
            });
        }

        // 2. RISK-BASED INTERVENTIONS (Always keeping these as safety nets)
        // High Depression Risk (PHQ-2 >= 3)
        if (phq2 >= 3) {
            interventions.push({
                type: 'behavioral_activation',
                title: 'Small Daily Task',
                description: 'Choose one small task you can do today that brings you a sense of accomplishment',
                evidenceBase: 'Behavioral activation for depression',
                duration: 15,
                cognitiveLoad: 'low',
                priority: 1
            });
        }

        // GUIDED BREATHING (for anxiety - GAD-2 ≥ 3)
        if (gad2 >= 3) {
            interventions.push({
                type: 'guided_breathing',
                title: '4-7-8 Breathing Exercise',
                description: 'Breathe in for 4 counts, hold for 7, breathe out for 8. Repeat 4 times.',
                evidenceBase: 'Breathing exercises for anxiety reduction',
                duration: 5,
                cognitiveLoad: 'low',
                priority: 1
            });
        }

        // COGNITIVE REFRAMING (for anxiety - GAD-2 ≥ 3)
        if (gad2 >= 3) {
            interventions.push({
                type: 'cognitive_reframing',
                title: 'Challenge Worried Thoughts',
                description: 'Write down one worry. Ask yourself: Is this thought really true? What else could be true?',
                evidenceBase: 'Cognitive restructuring for anxiety',
                duration: 10,
                cognitiveLoad: 'medium',
                priority: 2
            });
        }

        // EXPRESSIVE WRITING (for low wellbeing - WHO-5 < 50)
        if (who5 < 50) {
            interventions.push({
                type: 'expressive_writing',
                title: '10-Minute Journaling',
                description: 'Write freely about your feelings for 10 minutes. No one will read it but you.',
                evidenceBase: 'Expressive writing for emotional processing',
                duration: 10,
                cognitiveLoad: 'low',
                priority: 1
            });
        }

        // GRATITUDE REFLECTION (for low wellbeing - WHO-5 < 70)
        if (who5 < 70) {
            interventions.push({
                type: 'gratitude_practice',
                title: 'Three Good Things',
                description: 'Think of 3 small things that went okay today, no matter how small',
                evidenceBase: 'Gratitude practice for wellbeing',
                duration: 5,
                cognitiveLoad: 'low',
                priority: 2
            });
        }

        // GROUNDING TECHNIQUE (for high distress - tier = red/orange)
        if (tier === 'red' || tier === 'orange') {
            interventions.push({
                type: 'grounding_technique',
                title: '5-4-3-2-1 Grounding',
                description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
                evidenceBase: 'Grounding for acute distress',
                duration: 5,
                cognitiveLoad: 'low',
                priority: 1
            });
        }

        // GENTLE MOVEMENT (for moderate distress - tier = yellow/green)
        if (tier === 'yellow' || tier === 'green') {
            interventions.push({
                type: 'gentle_movement',
                title: 'Gentle Stretching',
                description: 'Do 5 minutes of gentle stretches or a short walk',
                evidenceBase: 'Physical activity for mood improvement',
                duration: 10,
                cognitiveLoad: 'low',
                priority: 2
            });
        }

        // SOCIAL CONNECTION (for moderate wellbeing)
        if (who5 >= 50 && who5 < 80) {
            interventions.push({
                type: 'social_connection',
                title: 'Connect with Someone',
                description: 'Send a message or call someone you care about',
                evidenceBase: 'Social connection for wellbeing',
                duration: 15,
                cognitiveLoad: 'low',
                priority: 2
            });
        }

        return interventions;
    }

    /**
     * Rank interventions by personal success rate
     */
    rankByPersonalSuccess(interventions, pastOutcomes) {
        if (pastOutcomes.length === 0) {
            // No history, return by default priority
            return interventions.sort((a, b) => a.priority - b.priority);
        }

        const rankedInterventions = interventions.map(intervention => {
            const pastAttempts = pastOutcomes.filter(
                o => o.intervention_type === intervention.type
            );

            const successfulAttempts = pastAttempts.filter(
                o => o.outcome_rating >= 4 && o.improvement_delta > 0
            );

            const successRate = pastAttempts.length > 0
                ? successfulAttempts.length / pastAttempts.length
                : 0.5; // Default 50% for untried interventions

            const avgImprovement = pastAttempts.length > 0
                ? pastAttempts.reduce((sum, o) => sum + (o.improvement_delta || 0), 0) / pastAttempts.length
                : 0;

            return {
                ...intervention,
                successRate,
                avgImprovement,
                adjustedPriority: intervention.priority * (1 / (successRate + 0.1)) // Lower is better
            };
        });

        // Sort by success rate (higher first), then by avg improvement
        return rankedInterventions.sort((a, b) => {
            if (Math.abs(a.successRate - b.successRate) > 0.1) {
                return b.successRate - a.successRate;
            }
            return b.avgImprovement - a.avgImprovement;
        });
    }

    /**
     * Adjust interventions for cognitive load based on emotional state
     */
    adjustForCognitiveLoad(interventions, tier, userProfile) {
        const educationLevel = userProfile.education_level || 'primary';

        // Filter out high cognitive load interventions for red/orange tier
        if (tier === 'red' || tier === 'orange') {
            return interventions.filter(i => i.cognitiveLoad === 'low');
        }

        // Filter by education level
        if (educationLevel === 'none' || educationLevel === 'primary') {
            return interventions.filter(i => i.cognitiveLoad !== 'high');
        }

        return interventions;
    }

    /**
     * Simplify intervention descriptions using AI
     */
    async simplifyInterventionDescriptions(interventions, language, educationLevel) {
        const simplified = await Promise.all(
            interventions.map(async (intervention) => {
                const simplifiedDescription = await simplifyLanguage(
                    intervention.description,
                    language,
                    educationLevel
                );

                return {
                    ...intervention,
                    description: simplifiedDescription
                };
            })
        );

        return simplified;
    }

    /**
     * Get past outcomes for learning
     */
    async getPastOutcomes(userId) {
        const result = await db.query(
            `SELECT * FROM intervention_outcomes 
             WHERE user_id = $1 AND user_completed = true
             ORDER BY completed_at DESC 
             LIMIT 30`,
            [userId]
        );

        return result.rows;
    }

    /**
     * Calculate confidence from past outcomes
     */
    calculateConfidenceFromOutcomes(pastOutcomes) {
        if (pastOutcomes.length === 0) return 0.5;
        if (pastOutcomes.length < 5) return 0.6;
        if (pastOutcomes.length < 15) return 0.75;
        return 0.9;
    }
}

module.exports = EvidenceBasedInterventionAgent;
