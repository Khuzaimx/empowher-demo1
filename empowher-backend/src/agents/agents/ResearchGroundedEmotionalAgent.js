const {
    calculatePHQ2Score,
    calculateGAD2Score,
    calculateWHO5Score,
    assessRiskThresholds,
    generateEmotionalTier,
    generateSimplifiedExplanation
} = require('../../services/researchInstruments');
const { analyzeSentiment, simplifyLanguage, generateAIResponse } = require('../../services/aiService');
const db = require('../../config/database');

/**
 * Research-Grounded Emotional Agent (Priority 2)
 * Analyzes emotional state using validated research instruments:
 * - PHQ-2 (Depression Screening)
 * - GAD-2 (Anxiety Screening)  
 * - WHO-5 (Wellbeing Index)
 * 
 * Replaces simple mood/stress classification with evidence-based assessment
 */
class ResearchGroundedEmotionalAgent {
    /**
     * Analyze user's emotional state using research instruments
     * @param {Object} context - { userId, checkinData, memory, userProfile }
     * @returns {Promise<Object>} - Agent decision with research-based insights
     */
    async analyze({ userId, checkinData, memory, userProfile = {} }) {
        const {
            phq2_q1, phq2_q2,
            gad2_q1, gad2_q2,
            who5_q1, who5_q2, who5_q3,
            journal,
            mood_score, // Backward compatibility
            stress_level // Backward compatibility
        } = checkinData;

        // Calculate research instrument scores
        const phq2 = calculatePHQ2Score({ phq2_q1, phq2_q2 });
        const gad2 = calculateGAD2Score({ gad2_q1, gad2_q2 });
        const who5 = calculateWHO5Score({ who5_q1, who5_q2, who5_q3 });

        // Assess risk thresholds
        const risk = assessRiskThresholds(phq2, gad2, who5);

        // Generate emotional tier (Green/Yellow/Orange/Red)
        const tier = generateEmotionalTier(phq2, gad2, who5);

        // Analyze 7-day trend from memory
        const trend = this.analyzeTrend(memory.shortTerm, 'phq2_total_score');

        // Determine emotional stability (for SkillGrowthAgent)
        const isStable = tier === 'green' || tier === 'yellow';

        // Analyze journal sentiment if provided
        let sentimentAnalysis = null;
        if (journal && journal.trim().length > 0) {
            const language = userProfile.preferred_language || 'en';
            sentimentAnalysis = await analyzeSentiment(journal, language);
        }

        // Generate simplified explanation (no medical language)
        const language = userProfile.preferred_language || 'en';
        const educationLevel = userProfile.education_level || 'primary';
        const simplifiedExplanation = generateSimplifiedExplanation(tier, phq2, gad2, who5, language);

        // Generate personalized insights using AI
        let aiResponse = null;
        let insights = [];
        let encouragement = simplifiedExplanation;

        const systemPrompt = `You are an empathetic, research-grounded emotional insight agent for women in rural Pakistan.
            
            Your goal is to analyze PHQ-2, GAD-2, and WHO-5 scores to determine the user's emotional state.
            
            CONTEXT:
            - Emotional Stage: ${memory?.emotionalStage || 'unknown'} (Based on 14-day trend)
            - Trend Direction: ${memory?.trendDirection || 'stable'}
            - Recent History: ${JSON.stringify(memory?.shortTerm?.slice(0, 3) || [])}
            
            GUIDELINES:
            1. Analyze the scores using clinical cutoffs (PHQ-2 >= 3, GAD-2 >= 3).
            2. If "Emotional Stage" is "distress" or "struggling", prioritize validation and immediate coping.
            3. If "Emotional Stage" is "improving" or "thriving", reinforce positive progress.
            4. Provide a simplified explanation of the scores in a warm, non-clinical tone.
            5. Flag any high risks (scores >= 3) clearly.`;

        try {
            // Construct prompt for AI
            const aiPrompt = `
            Analyze the following PHQ-2, GAD-2, and WHO-5 scores and user context.
            
            SCORES:
            - PHQ-2: ${phq2.total} (Risk: ${phq2.riskFlag})
            - GAD-2: ${gad2.total} (Risk: ${gad2.riskFlag})
            - WHO-5: ${who5.normalized} (Wellbeing: ${risk.lowWellbeing ? 'Low' : 'OK'})
            - Emotional Tier: ${tier}
            - 7-Day Trend: ${trend.direction}
            
            JOURNAL: "${journal || ''}"
            
            OUTPUT FORMAT:
            Respond with valid JSON only:
            {
                "insights": ["insight 1", "insight 2"],
                "encouragement": "warm, personalized encouragement string"
            }
            `;

            console.log('[ResearchGroundedEmotionalAgent] Calling AI with prompt length:', aiPrompt.length);

            const rawAiResponse = await generateAIResponse(
                systemPrompt,
                aiPrompt,
                { temperature: 0.7 }
            );

            console.log('[ResearchGroundedEmotionalAgent] Raw AI Response:', rawAiResponse);

            // Parse JSON response
            // Handle potential markdown code blocks in response
            const cleanedResponse = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            aiResponse = JSON.parse(cleanedResponse);

            if (aiResponse.insights && Array.isArray(aiResponse.insights)) {
                insights = aiResponse.insights;
            }
            if (aiResponse.encouragement) {
                encouragement = aiResponse.encouragement;
            }

        } catch (err) {
            console.error('[ResearchGroundedEmotionalAgent] AI generation failed, falling back to rules:', err);
            // Fallback to rule-based insights if AI fails
            insights = await this.generateSimplifiedInsights(
                phq2, gad2, who5, trend, sentimentAnalysis, language, educationLevel
            );
        }

        // Calculate confidence based on data completeness
        const confidence = this.calculateConfidence(memory.shortTerm, phq2, gad2, who5);

        return {
            level: tier, // For backward compatibility
            isStable,
            confidence,
            input: {
                phq2_q1, phq2_q2,
                gad2_q1, gad2_q2,
                who5_q1, who5_q2, who5_q3,
                systemPrompt,
                journalLength: journal?.length || 0,
                historyLength: memory.shortTerm.length
            },
            output: {
                phq2Score: phq2.total,
                gad2Score: gad2.total,
                who5Score: who5.normalized
            },
            insights: insights.length > 0 ? insights : ['Your check-in has been recorded.'],
            encouragement,
            // Store for database logging
            researchScores: { phq2, gad2, who5 },
            riskFlags: risk,
            sentimentAnalysis
        };
    }

    /**
     * Analyze trend from short-term memory using research scores
     * @param {Array} shortTermMemory - Recent emotional entries
     * @param {string} scoreField - Field to analyze (e.g., 'phq2_total_score')
     * @returns {Object} - Trend analysis
     */
    analyzeTrend(shortTermMemory, scoreField = 'phq2_total_score') {
        if (shortTermMemory.length < 3) {
            return {
                direction: 'insufficient_data',
                strength: 0,
                description: 'Building your history',
                change: 0
            };
        }

        // Get recent scores (last 7 entries)
        const recentScores = shortTermMemory
            .slice(0, 7)
            .map(e => e[scoreField])
            .filter(s => s !== null && s !== undefined);

        if (recentScores.length === 0) {
            return {
                direction: 'insufficient_data',
                strength: 0,
                description: 'Building your history',
                change: 0
            };
        }

        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

        // Get previous scores (entries 8-14)
        const previousScores = shortTermMemory
            .slice(7, 14)
            .map(e => e[scoreField])
            .filter(s => s !== null && s !== undefined);

        if (previousScores.length === 0) {
            return {
                direction: 'insufficient_data',
                strength: 0,
                description: 'Building your history',
                change: 0
            };
        }

        const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;

        // For PHQ/GAD: lower is better (decreasing = improving)
        // For WHO-5: higher is better (increasing = improving)
        const change = scoreField.includes('who5')
            ? recentAvg - previousAvg  // WHO-5: positive change = improvement
            : previousAvg - recentAvg; // PHQ/GAD: negative change = improvement

        let direction, description;

        if (change > 1) {
            direction = 'improving';
            description = 'Your wellbeing is improving! 📈';
        } else if (change < -1) {
            direction = 'declining';
            description = 'Your wellbeing needs attention 💙';
        } else {
            direction = 'stable';
            description = 'Your wellbeing is stable';
        }

        return {
            direction,
            strength: Math.abs(change),
            description,
            change: change.toFixed(2)
        };
    }

    /**
     * Generate simplified insights using AI language simplification
     * @param {Object} phq2 - PHQ-2 scores
     * @param {Object} gad2 - GAD-2 scores
     * @param {Object} who5 - WHO-5 scores
     * @param {Object} trend - Trend analysis
     * @param {Object} sentimentAnalysis - Sentiment from journal
     * @param {string} language - Target language
     * @param {string} educationLevel - User's education level
     * @returns {Promise<Array>} - Array of simplified insight strings
     */
    async generateSimplifiedInsights(phq2, gad2, who5, trend, sentimentAnalysis, language, educationLevel) {
        const insights = [];

        // Wellbeing insight
        if (who5.normalized >= 70) {
            insights.push('You are feeling good overall');
        } else if (who5.normalized >= 50) {
            insights.push('Your wellbeing is okay, but could be better');
        } else {
            insights.push('You might be struggling right now');
        }

        // Trend insight
        if (trend.direction !== 'insufficient_data') {
            insights.push(trend.description);
        }

        // Depression risk insight (simplified)
        if (phq2.riskFlag) {
            insights.push('You might be feeling very low lately');
        }

        // Anxiety risk insight (simplified)
        if (gad2.riskFlag) {
            insights.push('You might be feeling very worried lately');
        }

        // Sentiment insight
        if (sentimentAnalysis) {
            if (sentimentAnalysis.score > 0.3) {
                insights.push('Your journal shows positive feelings');
            } else if (sentimentAnalysis.score < -0.3) {
                insights.push('Your journal shows you might be struggling');
            }
        }

        // Simplify each insight using AI
        const simplifiedInsights = await Promise.all(
            insights.map(insight => simplifyLanguage(insight, language, educationLevel))
        );

        return simplifiedInsights;
    }

    /**
     * Calculate confidence based on data completeness and consistency
     * @param {Array} shortTermMemory - Recent entries
     * @param {Object} phq2 - PHQ-2 scores
     * @param {Object} gad2 - GAD-2 scores
     * @param {Object} who5 - WHO-5 scores
     * @returns {number} - Confidence score (0-1)
     */
    calculateConfidence(shortTermMemory, phq2, gad2, who5) {
        let confidence = 0.5; // Base confidence

        // Increase confidence with more historical data
        if (shortTermMemory.length >= 14) confidence += 0.2;
        else if (shortTermMemory.length >= 7) confidence += 0.15;
        else if (shortTermMemory.length >= 3) confidence += 0.1;

        // Increase confidence if all instruments completed
        const allCompleted = phq2.total !== null && gad2.total !== null && who5.normalized !== null;
        if (allCompleted) confidence += 0.2;

        // Cap at 0.95
        return Math.min(confidence, 0.95);
    }
}

module.exports = ResearchGroundedEmotionalAgent;
