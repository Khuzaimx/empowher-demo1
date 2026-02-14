
require('dotenv').config();
const AgentOrchestrator = require('./src/agents/AgentOrchestrator');
const db = require('./src/config/database');

async function debugCheckin() {
    try {
        console.log('--- Debugging Check-in 500 Error ---');

        const orchestrator = new AgentOrchestrator();

        // Get a user ID
        const userResult = await db.query('SELECT id FROM users LIMIT 1');
        const userId = userResult.rows[0].id;
        console.log(`Using User ID: ${userId}`);

        // Simulate payload from frontend
        const checkinData = {
            phq2_q1: 1,
            phq2_q2: 0,
            gad2_q1: 2,
            gad2_q2: 1,
            who5_q1: 3,
            who5_q2: 4,
            who5_q3: 2,
            journal: "Debugging the 500 error.",
            mood_score: 7,
            energy_level: "medium",
            stress_level: "low",
            interests: ['coding', 'wellness']
        };

        console.log('Processing check-in...');
        const result = await orchestrator.processCheckin(userId, checkinData);
        console.log('Check-in processed successfully!');

        // Check for agent failures
        if (result.insights && result.insights[0].includes('trouble analyzing')) {
            console.error('FAILURE: ResearchGroundedEmotionalAgent failed and returned fallback.');
        } else {
            console.log('SUCCESS: ResearchGroundedEmotionalAgent worked.');
        }

        if (result.immediateActions.length === 0 && result.agentDecisions.intervention.reasoning === 'Agent failed') {
            console.error('FAILURE: EvidenceBasedInterventionAgent failed and returned fallback.');
        } else {
            console.log('SUCCESS: EvidenceBasedInterventionAgent worked.');
        }

        // console.log(JSON.stringify(result, null, 2)); // Don't print huge JSON
        process.exit(0);
    } catch (error) {
        console.error('CRASH DETECTED!');
        console.error(error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

debugCheckin();
