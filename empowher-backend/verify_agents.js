require('dotenv').config();
const AgentOrchestrator = require('./src/agents/AgentOrchestrator');
const db = require('./src/config/database');

async function testAgents() {
    try {
        console.log('--- Starting Agent Verification ---');

        // Mock user ID (replace with a valid one if needed, or we can just mock the context)
        // For this test, we'll instantiate the orchestrator and call the agents directly 
        // to avoid needing a full DB setup if possible, or we rely on the existing DB connection.

        // Let's assume we have a user. If not, we might need to create one.
        // But to be safe and avoid DB constraints, let's just unit test the AGENTS with a mocked context.


        console.log('Initializing AgentOrchestrator...');
        let orchestrator;
        try {
            orchestrator = new AgentOrchestrator();
            console.log('AgentOrchestrator initialized.');
        } catch (initError) {
            console.error('Failed to initialize AgentOrchestrator:', initError);
            throw initError;
        }

        // Fetch a real user ID for database operations
        console.log('Connecting to database...');
        const userResult = await db.query('SELECT id FROM users LIMIT 1');
        if (userResult.rows.length === 0) {
            console.error('No users found in database. Please run seed script or create a user.');
            process.exit(1);
        }
        const userId = userResult.rows[0].id;
        console.log(`Using User ID: ${userId}`);

        // Mock Context for "Distress" Stage
        const distressContext = {
            userId: userId,
            checkinData: {
                phq2_q1: 3, phq2_q2: 3, // High PHQ-2
                gad2_q1: 3, gad2_q2: 3, // High GAD-2
                who5_q1: 1, who5_q2: 1, who5_q3: 1, // Low WHO-5
                journal: "I feel terrible."
            },
            memory: {
                emotionalStage: 'distress',
                trendDirection: 'declining',
                shortTerm: []
            },
            userProfile: { education_level: 'primary', preferred_language: 'en' }
        };

        console.log('\nTesting Distress Stage:');
        try {
            const emotionalDecision = await orchestrator.agents.emotional.analyze(distressContext);
            console.log('Emotional Level:', emotionalDecision.level);

            const interventionDecision = await orchestrator.agents.intervention.analyze({
                ...distressContext,
                emotionalInsight: emotionalDecision,
                userProfile: distressContext.userProfile
            });
            console.log('Recommended Interventions:', interventionDecision.actions.map(a => a.title));
        } catch (distressError) {
            console.error('Error during Distress Stage test:', distressError);
        }
        // Expecting "Grounding" and "Breathing"

        // Mock Context for "Thriving" Stage
        const thrivingContext = {
            userId: userId,
            checkinData: {
                phq2_q1: 0, phq2_q2: 0,
                gad2_q1: 0, gad2_q2: 0,
                who5_q1: 5, who5_q2: 5, who5_q3: 5,
                journal: "I feel great!"
            },
            memory: {
                emotionalStage: 'thriving',
                trendDirection: 'improving',
                shortTerm: []
            },
            userProfile: { education_level: 'university', preferred_language: 'en' }
        };

        console.log('\nTesting Thriving Stage:');
        try {
            const emotionalDecisionThriving = await orchestrator.agents.emotional.analyze(thrivingContext);

            const interventionDecisionThriving = await orchestrator.agents.intervention.analyze({
                ...thrivingContext,
                emotionalInsight: emotionalDecisionThriving,
                userProfile: thrivingContext.userProfile
            });

            console.log('Recommended Interventions:', interventionDecisionThriving.actions.map(a => a.title));

            const skillDecision = await orchestrator.agents.skill.analyze({
                ...thrivingContext,
                emotionalInsight: emotionalDecisionThriving,
                userProfile: thrivingContext.userProfile
            });

            console.log('Recommended Skills:', skillDecision.recommendations ? skillDecision.recommendations.map(r => r.id) : 'None');

        } catch (thrivingError) {
            console.error('Error during Thriving Stage test:', thrivingError);
        }


        console.log('\n--- Verification Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testAgents();
