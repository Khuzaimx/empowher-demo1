
require('dotenv').config();
const AgentOrchestrator = require('./src/agents/AgentOrchestrator');
const db = require('./src/config/database');

async function testResponses() {
    try {
        console.log('--- Testing for Generic Responses ---');
        const orchestrator = new AgentOrchestrator();
        const userResult = await db.query('SELECT id FROM users LIMIT 1');
        const userId = userResult.rows[0].id;

        // Case 1: High Distress / Crisis
        console.log('\n1. Sending DISTRESS check-in...');
        const distressData = {
            phq2_q1: 3, phq2_q2: 3, // Max depression
            gad2_q1: 3, gad2_q2: 3, // Max anxiety
            who5_q1: 0, who5_q2: 0, who5_q3: 0, // Min wellbeing
            journal: "I feel hopeless and I don't want to exist anymore. Everything is black.",
            mood_score: 1, energy_level: "low", stress_level: "high"
        };
        const distressResult = await orchestrator.processCheckin(userId, distressData);
        console.log('Distress Insights:', distressResult.insights);
        console.log('Distress Encouragement:', distressResult.encouragement);

        // Case 2: Thriving
        console.log('\n2. Sending THRIVING check-in...');
        const thrivingData = {
            phq2_q1: 0, phq2_q2: 0,
            gad2_q1: 0, gad2_q2: 0,
            who5_q1: 5, who5_q2: 5, who5_q3: 5, // Max wellbeing
            journal: "I feel amazing today! I accomplished so much and feel very connected to my family.",
            mood_score: 10, energy_level: "high", stress_level: "low"
        };
        const thrivingResult = await orchestrator.processCheckin(userId, thrivingData);
        console.log('Thriving Insights:', thrivingResult.insights);
        console.log('Thriving Encouragement:', thrivingResult.encouragement);

        const fs = require('fs');
        let output = '';
        output += '--- DISTRESS RESPONSE ---\n';
        output += `Insights: ${JSON.stringify(distressResult.insights, null, 2)}\n`;
        output += `Encouragement: ${distressResult.encouragement}\n\n`;

        output += '--- THRIVING RESPONSE ---\n';
        output += `Insights: ${JSON.stringify(thrivingResult.insights, null, 2)}\n`;
        output += `Encouragement: ${thrivingResult.encouragement}\n\n`;

        if (distressResult.encouragement === thrivingResult.encouragement) {
            output += 'FAIL: Responses are IDENTICAL.\n';
        } else {
            output += 'SUCCESS: Responses are different.\n';
        }

        fs.writeFileSync('response_comparison.txt', output);
        console.log('Output written to response_comparison.txt');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

testResponses();
