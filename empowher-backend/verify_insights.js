
const fs = require('fs');
const path = require('path');

// Mock DB configuration to prevent connection errors if possible
// (This is hard because require happens immediately, but we can try to catch it)

async function run() {
    try {
        console.log('Starting verification...');

        // We need to require the agent. If it fails due to DB, we catch it.
        const ResearchGroundedEmotionalAgent = require('./src/agents/agents/ResearchGroundedEmotionalAgent');
        const agent = new ResearchGroundedEmotionalAgent();

        const context = {
            userId: 'test-user',
            checkinData: {
                phq2_q1: 3, phq2_q2: 3,
                gad2_q1: 3, gad2_q2: 3,
                who5_q1: 0, who5_q2: 0, who5_q3: 0,
                journal: "I feel very distressed and hopeless.",
                mood_score: 1, stress_level: "high"
            },
            memory: { shortTerm: [], emotionalStage: 'distress', trendDirection: 'declining' },
            userProfile: { preferred_language: 'en', education_level: 'primary' }
        };

        const result = await agent.analyze(context);

        if (!result.output || typeof result.output.phq2Score === 'undefined') {
            throw new Error('Missing output.phq2Score in agent result - this will crash downstream agents!');
        }

        const output = {
            status: 'success',
            insights: result.insights,
            encouragement: result.encouragement,
            outputData: result.output // Log the output data
        };

        fs.writeFileSync('verify_result.json', JSON.stringify(output, null, 2));
        console.log('Verification finished. Result written to verify_result.json');

    } catch (e) {
        console.error('Verification failed:', e);
        const errorOutput = {
            status: 'error',
            message: e.message,
            stack: e.stack
        };
        fs.writeFileSync('verify_result.json', JSON.stringify(errorOutput, null, 2));
    }
}

run();
