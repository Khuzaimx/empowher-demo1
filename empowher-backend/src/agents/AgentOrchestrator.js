const db = require('../config/database');
const { prepareJournalForStorage } = require('../services/encryptionService');

// Import agents
const CrisisAgent = require('./agents/CrisisAgent');
const ResearchGroundedEmotionalAgent = require('./agents/ResearchGroundedEmotionalAgent');
const EvidenceBasedInterventionAgent = require('./agents/EvidenceBasedInterventionAgent');
const EthicsGuardAgent = require('./agents/EthicsGuardAgent');
const SkillGrowthAgent = require('./agents/SkillGrowthAgent');
const CourseRecommendationAgent = require('./agents/CourseRecommendationAgent');

// Import memory and reflection
const MemoryManager = require('./memory/MemoryManager');
const OutcomeTracker = require('./reflection/OutcomeTracker');

/**
 * Agent Orchestrator (Research-Grounded Version)
 * Central coordination layer for multi-agent system
 * 
 * Priority Order:
 * 1. CrisisAgent - Detects crisis situations
 * 2. ResearchGroundedEmotionalAgent - PHQ-2/GAD-2/WHO-5 assessment
 * 3. EvidenceBasedInterventionAgent - Research-backed interventions
 * 4. EthicsGuardAgent - Reviews interventions for ethical delivery
 * 5. SkillGrowthAgent - Recommends skills (only if emotionally stable)
 */
class AgentOrchestrator {
    constructor() {
        // Initialize agents
        this.agents = {
            crisis: new CrisisAgent(),
            emotional: new ResearchGroundedEmotionalAgent(),
            intervention: new EvidenceBasedInterventionAgent(),
            ethics: new EthicsGuardAgent(),
            skill: new SkillGrowthAgent(),
            course: CourseRecommendationAgent
        };

        // Initialize memory and reflection systems
        this.memoryManager = new MemoryManager();
        this.outcomeTracker = new OutcomeTracker();
    }

    /**
     * Process emotional check-in through agent system
     */
    async processCheckin(userId, checkinData) {
        console.log(`[AgentOrchestrator] Processing check-in for user ${userId}`);

        // 1. Load user memory
        const memory = await this.memoryManager.getUserMemory(userId);
        console.log(`[AgentOrchestrator] Loaded memory: ${memory.shortTerm.length} recent entries, trend: ${memory.trendDirection}`);

        // 2. Detect format and prepare data
        const hasResearchInstruments = checkinData.phq2_q1 !== undefined || checkinData.gad2_q1 !== undefined || checkinData.who5_q1 !== undefined;

        let mood_score, energy_level, stress_level;

        if (hasResearchInstruments) {
            console.log('[AgentOrchestrator] Using research instrument format');
            // Derive legacy fields from research instruments for database compatibility
            // Use WHO-5 normalized score (0-100) mapped to mood_score (1-10)
            const who5Raw = (checkinData.who5_q1 || 0) + (checkinData.who5_q2 || 0) + (checkinData.who5_q3 || 0);
            const who5Normalized = Math.round((who5Raw * 100) / 15);
            mood_score = Math.max(1, Math.min(10, Math.round(who5Normalized / 10)));

            // Map energy from WHO-5 Q2 (active and energetic)
            const energyScore = checkinData.who5_q2 || 0;
            energy_level = energyScore >= 4 ? 'high' : energyScore >= 2 ? 'medium' : 'low';

            // Map stress from GAD-2 total (inverted - higher anxiety = higher stress)
            const anxietyScore = (checkinData.gad2_q1 || 0) + (checkinData.gad2_q2 || 0);
            stress_level = anxietyScore >= 4 ? 'high' : anxietyScore >= 2 ? 'medium' : 'low';
        } else {
            console.log('[AgentOrchestrator] Using legacy format');
            // Use legacy format directly
            mood_score = checkinData.mood_score;
            energy_level = checkinData.energy_level;
            stress_level = checkinData.stress_level;
        }

        const { journal, interests = [] } = checkinData;

        // Prepare encrypted journal
        const journalData = prepareJournalForStorage(journal);

        // We'll get emotional level from EmotionalInsightAgent
        // For now, use a safe default that will be updated by the agent
        const emotionalLevelPlaceholder = 'yellow';

        // Insert emotional entry
        const entryResult = await db.query(
            `INSERT INTO emotional_entries 
       (user_id, mood_score, energy_level, stress_level, journal_encrypted, journal_iv, journal_auth_tag, emotional_level) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, created_at`,
            [userId, mood_score, energy_level, stress_level, journalData.journal_encrypted, journalData.journal_iv, journalData.journal_auth_tag, emotionalLevelPlaceholder]
        );

        const entryId = entryResult.rows[0].id;

        // Insert interest tags
        if (interests.length > 0) {
            const interestValues = interests.map((tag, index) =>
                `($1, $${index + 2})`
            ).join(', ');

            const interestParams = [entryId, ...interests];

            await db.query(
                `INSERT INTO interest_tags (entry_id, tag) VALUES ${interestValues}`,
                interestParams
            );
        }

        // 3. Run agents in priority order
        const context = { userId, checkinData, memory };

        // PRIORITY 1: Crisis Agent - Can override everything
        console.log('[AgentOrchestrator] Running CrisisAgent...');
        const crisisDecision = await this.agents.crisis.analyze(context);
        await this.logDecision(userId, 'CrisisAgent', crisisDecision);

        if (crisisDecision.shouldActivate) {
            console.log('[AgentOrchestrator] ⚠️  CRISIS DETECTED - Activating crisis protocol');

            // Update emotional entry with red level
            await db.query(
                'UPDATE emotional_entries SET emotional_level = $1 WHERE id = $2',
                ['red', entryId]
            );

            // Update memory
            await this.memoryManager.updateLongTermTrends(userId);

            return {
                priority: 'CRITICAL',
                agent: 'CrisisAgent',
                emotionalLevel: 'red',
                actions: crisisDecision.actions,
                crisisProtocol: true,
                crisisData: crisisDecision.output,
                message: 'Crisis protocol activated. Please reach out for support.'
            };
        }

        // PRIORITY 2: Research-Grounded Emotional Agent
        console.log('[AgentOrchestrator] Running ResearchGroundedEmotionalAgent...');
        let emotionalDecision;
        try {
            emotionalDecision = await this.agents.emotional.analyze(context);
            await this.logDecision(userId, 'ResearchGroundedEmotionalAgent', emotionalDecision);
        } catch (err) {
            console.error('[AgentOrchestrator] Error in ResearchGroundedEmotionalAgent:', err);
            require('fs').appendFileSync('agent_error.log', `[${new Date().toISOString()}] Error in ResearchGroundedEmotionalAgent: ${err.message}\n${err.stack}\n`);
            // Fallback if agent fails
            emotionalDecision = {
                level: 'yellow',
                isStable: true,
                confidence: 0,
                insights: ['We are having trouble analyzing your check-in, but we are here for you.'],
                encouragement: 'Take a deep breath. We are logging this issue.',
                output: { simplifiedExplanation: 'Emotional analysis unavailable temporarily.', trend: { direction: 'stable' } },
                researchScores: { phq2: { total: 0 }, gad2: { total: 0 }, who5: { normalized: 50 } },
                riskFlags: { depressionRisk: false, anxietyRisk: false, riskProbability: 0 }
            };
        }

        // Update emotional entry with research scores and classified level
        try {
            const { researchScores, riskFlags, sentimentAnalysis } = emotionalDecision;
            await db.query(
                `UPDATE emotional_entries SET 
                    emotional_level = $1,
                    phq2_q1_score = $2, phq2_q2_score = $3, phq2_total_score = $4,
                    gad2_q1_score = $5, gad2_q2_score = $6, gad2_total_score = $7,
                    who5_q1_score = $8, who5_q2_score = $9, who5_q3_score = $10, who5_total_score = $11,
                    depression_risk_flag = $12, anxiety_risk_flag = $13, risk_probability_score = $14,
                    journal_sentiment_score = $15, simplified_explanation = $16
                WHERE id = $17`,
                [
                    emotionalDecision.level,
                    researchScores?.phq2?.q1 || 0, researchScores?.phq2?.q2 || 0, researchScores?.phq2?.total || 0,
                    researchScores?.gad2?.q1 || 0, researchScores?.gad2?.q2 || 0, researchScores?.gad2?.total || 0,
                    researchScores?.who5?.q1 || 0, researchScores?.who5?.q2 || 0, researchScores?.who5?.q3 || 0, researchScores?.who5?.normalized || 50,
                    riskFlags?.depressionRisk || false, riskFlags?.anxietyRisk || false, riskFlags?.riskProbability || 0,
                    sentimentAnalysis?.score || null, emotionalDecision.output?.simplifiedExplanation || 'Analysis pending',
                    entryId
                ]
            );
        } catch (dbError) {
            console.error('[AgentOrchestrator] Error updating emotional entry:', dbError);
        }

        // PRIORITY 3: Evidence-Based Intervention Agent
        console.log('[AgentOrchestrator] Running EvidenceBasedInterventionAgent...');
        let interventionDecision;
        try {
            interventionDecision = await this.agents.intervention.analyze({
                ...context,
                emotionalInsight: emotionalDecision,
                userProfile: {} // Placeholder, should be fetched from DB or context
            });
            await this.logDecision(userId, 'EvidenceBasedInterventionAgent', interventionDecision);
        } catch (err) {
            console.error('[AgentOrchestrator] Error in EvidenceBasedInterventionAgent:', err);
            require('fs').appendFileSync('agent_error.log', `[${new Date().toISOString()}] Error in EvidenceBasedInterventionAgent: ${err.message}\n${err.stack}\n`);
            interventionDecision = { confidence: 0, actions: [], reasoning: 'Agent failed' };
        }

        // PRIORITY 4: Ethics Guard Agent (reviews interventions)
        console.log('[AgentOrchestrator] Running EthicsGuardAgent...');
        let ethicsDecision;
        try {
            ethicsDecision = await this.agents.ethics.analyze({
                ...context,
                interventions: interventionDecision.actions || [],
                emotionalInsight: emotionalDecision
            });
            await this.logDecision(userId, 'EthicsGuardAgent', ethicsDecision);
        } catch (err) {
            console.error('[AgentOrchestrator] Error in EthicsGuardAgent:', err);
            ethicsDecision = { output: { approvedInterventions: [], adjustments: [] } };
        }

        // Use ethics-approved interventions
        const approvedInterventions = ethicsDecision.output?.approvedInterventions || [];

        // PRIORITY 5: Skill Growth Agent (only if emotionally stable)
        let skillDecision = null;
        if (emotionalDecision.isStable) {
            console.log('[AgentOrchestrator] Running SkillGrowthAgent...');
            try {
                skillDecision = await this.agents.skill.analyze({
                    ...context,
                    emotionalInsight: emotionalDecision,
                    userProfile: {} // Placeholder
                });
                await this.logDecision(userId, 'SkillGrowthAgent', skillDecision);
            } catch (err) {
                console.error('[AgentOrchestrator] Error in SkillGrowthAgent:', err);
            }
        } else {
            console.log('[AgentOrchestrator] Skipping SkillGrowthAgent - user not emotionally stable');
        }

        // PRIORITY 6: Course Recommendation Agent (Hackathon Demo)
        // Suggests learning resources based on emotional state and interests
        console.log('[AgentOrchestrator] Running CourseRecommendationAgent...');
        let courseDecision = null;
        try {
            courseDecision = await this.agents.course.analyze({
                userId,
                emotionalInsight: emotionalDecision,
                userProfile: { interests } // Pass interests from check-in
            });
            await this.logDecision(userId, 'CourseRecommendationAgent', courseDecision);
        } catch (err) {
            console.error('[AgentOrchestrator] Error in CourseRecommendationAgent:', err);
            courseDecision = { hasRecommendation: false };
        }

        // 4. Update long-term memory trends
        await this.memoryManager.updateLongTermTrends(userId);

        // 5. Return orchestrated response
        console.log(`[AgentOrchestrator] ✓ Check-in processed successfully. Level: ${emotionalDecision.level}`);

        return {
            entryId,
            emotionalLevel: emotionalDecision.level,
            insights: emotionalDecision.insights,
            encouragement: emotionalDecision.encouragement,
            trend: emotionalDecision.output.trend,
            immediateActions: approvedInterventions,
            ethicalAdjustments: ethicsDecision.output.adjustments,
            skillRecommendations: skillDecision?.recommendations || [],
            courseRecommendation: courseDecision?.hasRecommendation ? courseDecision.course : null,
            agentDecisions: {
                emotional: {
                    confidence: emotionalDecision.confidence,
                    reasoning: emotionalDecision.reasoning
                },
                intervention: {
                    confidence: interventionDecision.confidence,
                    reasoning: interventionDecision.reasoning
                },
                skill: skillDecision ? {
                    confidence: skillDecision.confidence,
                    reasoning: skillDecision.reasoning
                } : null,
                course: courseDecision ? {
                    hasRecommendation: courseDecision.hasRecommendation,
                    reasoning: courseDecision.reasoning
                } : null
            }
        };
    }

    /**
     * Log agent decision to database
     */
    async logDecision(userId, agentName, decision) {
        try {
            const result = await db.query(
                `INSERT INTO agent_decisions 
         (user_id, agent_name, input_summary, decision_output, confidence_score, reasoning)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
                [
                    userId,
                    agentName,
                    JSON.stringify(decision.input || {}),
                    JSON.stringify(decision.output || {}),
                    decision.confidence || 0,
                    decision.reasoning || ''
                ]
            );

            console.log(`[AgentOrchestrator] Logged decision for ${agentName} (ID: ${result.rows[0].id}, confidence: ${decision.confidence})`);

            return result.rows[0].id;
        } catch (error) {
            console.error(`[AgentOrchestrator] Error logging decision for ${agentName}:`, error);
            throw error;
        }
    }

    /**
     * Record intervention outcome (for reflection loop)
     */
    async recordOutcome(userId, decisionId, action, completed, rating = null, timeToComplete = null) {
        return await this.outcomeTracker.recordOutcome(
            userId,
            decisionId,
            action,
            completed,
            rating,
            timeToComplete
        );
    }

    /**
     * Get agent decision history for a user
     */
    async getDecisionHistory(userId, limit = 10) {
        const result = await db.query(
            `SELECT * FROM agent_decisions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
            [userId, limit]
        );

        return result.rows;
    }
}

module.exports = AgentOrchestrator;
