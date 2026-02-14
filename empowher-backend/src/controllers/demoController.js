const db = require('../config/database');

/**
 * Demo Controller
 * Handles endpoints for the hackathon simulation/presentation
 */
exports.getDemoStory = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Get User Details
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        if (!user.is_demo) {
            return res.status(403).json({ message: 'This feature is only available for demo users.' });
        }

        // 2. Fetch Demo Profile (Simulated History)
        // For hackathon, we assume "Sarah" is the primary demo persona.
        // In a real system, we'd link by user_id, but here we query by static name for simplicity
        const profileResult = await db.query(
            `SELECT * FROM demo_profiles WHERE name = 'Sarah' LIMIT 1`
        );

        const demoProfile = profileResult.rows[0] || {};

        // 3. Fetch Real-time Agent Decisions
        const decisionsResult = await db.query(
            `SELECT * FROM agent_decisions 
             WHERE user_id = $1 
             ORDER BY created_at DESC LIMIT 5`,
            [userId]
        );

        // 4. Fetch Course Progress
        const coursesResult = await db.query(
            `SELECT c.title, c.category, uc.progress_percentage, uc.completion_status
             FROM user_courses uc
             JOIN courses c ON uc.course_id = c.id
             WHERE uc.user_id = $1`,
            [userId]
        );

        // 5. Construct Story Timeline
        const story = {
            persona: {
                name: demoProfile.name || 'Demo User',
                age: demoProfile.age,
                bg: `${demoProfile.village} - ${demoProfile.initial_stage} initially`
            },
            journey: [
                {
                    phase: 'Month 1 (History)',
                    description: demoProfile.emotional_progression_summary,
                    metrics: {
                        start_who5: 28,
                        end_who5: 52,
                        engagement: 'High'
                    }
                },
                {
                    phase: 'Week 4 (Learning)',
                    description: demoProfile.skill_progression_summary,
                    achievements: ['Basics of Budgeting']
                },
                {
                    phase: 'Today (Live)',
                    status: 'Live Demo',
                    current_stage: demoProfile.current_stage || 'improving',
                    recent_insights: decisionsResult.rows.map(d => ({
                        agent: d.agent_name,
                        output: d.decision_output
                    })),
                    active_courses: coursesResult.rows
                }
            ],
            impact_metrics: {
                engagement_score: demoProfile.engagement_score,
                emotional_growth: '+85% improvement in stability',
                skill_confidence: 'Ready for freelancing'
            }
        };

        res.json({ success: true, story });

    } catch (error) {
        console.error('[DemoController] Error fetching story:', error);
        res.status(500).json({ message: 'Server error generating demo story' });
    }
};
