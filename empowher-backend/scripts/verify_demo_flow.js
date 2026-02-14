const axios = require('axios');

const API_URL = 'http://localhost:5003/api';

async function verifyDemoFlow() {
    try {
        console.log('🔍 Starting Demo Flow Verification...');

        // 1. Login as Sarah
        console.log('1. Logging in as Sarah...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'sarah.demo@empowher.com',
            password: 'demo123'
        });

        const { token, user } = loginRes.data;
        const headers = { Authorization: `Bearer ${token}` };
        console.log(`   ✓ Logged in via ${user.email} (ID: ${user.id})`);

        // 2. Perform Check-in (should trigger CourseRecommendationAgent)
        console.log('\n2. Performing Check-in...');
        const checkinData = {
            // WHO-5: 0-25 raw -> normalized
            who5_q1: 2, // Low
            who5_q2: 3,
            who5_q3: 2,
            // GAD-2: 0-6
            gad2_q1: 1,
            gad2_q2: 1,
            // PHQ-2
            phq2_q1: 1,
            phq2_q2: 1,
            journal: "I'm feeling a bit better today, but still worried about money.",
            interests: ['Digital Skills', 'Freelancing']
        };

        const checkinRes = await axios.post(`${API_URL}/emotional/checkin`, checkinData, { headers });
        const { courseRecommendation, emotionalLevel } = checkinRes.data;

        console.log(`   ✓ Check-in processed. Level: ${emotionalLevel}`);
        if (courseRecommendation) {
            console.log(`   ✓ Course Recommended: ${courseRecommendation.title} (${courseRecommendation.category})`);
        } else {
            console.log('   ⚠️ No course recommended (unexpected for demo flow?)');
        }

        // 3. Fetch Demo Story
        console.log('\n3. Fetching Demo Story...');
        const storyRes = await axios.get(`${API_URL}/demo/story/${user.id}`, { headers });

        const { story } = storyRes.data;
        console.log(`   ✓ Story retrieved for persona: ${story.persona.name}`);
        console.log(`   ✓ Journey phases: ${story.journey.length}`);
        console.log(`   ✓ Recent insights: ${story.journey.find(j => j.phase === 'Today (Live)').recent_insights.length}`);

        console.log('\n✅ DEMO FLOW VERIFIED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.response?.data || error.message);
    }
}

verifyDemoFlow();
