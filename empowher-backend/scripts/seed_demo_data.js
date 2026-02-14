const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Direct connection to avoid module resolution issues
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDemoData() {
    // Note: pool.connect() returns a client
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🌱 Starting Demo Data Seed...');

        // 1. Create Demo User "Sarah"
        const email = 'sarah.demo@empowher.com';
        const hashedPassword = await bcrypt.hash('demo123', 10);

        // Upsert Sarah
        let userResult = await client.query(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );

        let userId;
        if (userResult.rows.length === 0) {
            console.log('Creating demo user Sarah...');
            const insertResult = await client.query(
                `INSERT INTO users (email, password_hash, is_demo)
                 VALUES ($1, $2, true)
                 RETURNING id`,
                [email, hashedPassword]
            );
            userId = insertResult.rows[0].id;
        } else {
            console.log('Updating existing Sarah to demo mode...');
            userId = userResult.rows[0].id;
            await client.query(
                `UPDATE users SET is_demo = true WHERE id = $1`,
                [userId]
            );
        }

        // 2. Create Demo Profile History
        console.log('Creating demo profile history...');
        await client.query(`DELETE FROM demo_profiles WHERE name = 'Sarah'`);

        await client.query(
            `INSERT INTO demo_profiles (
                name, age, village, initial_stage, current_stage,
                emotional_progression_summary, skill_progression_summary,
                engagement_score, interest_tags
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                'Sarah', 24, 'Chak 58 NB',
                'distress', 'improving',
                'Sarah started with high anxiety regarding household finances. Over 4 weeks, she consistently used the journal and breathing exercises. Her WHO-5 score improved from 28 to 52.',
                'Initially hesitant, she completed the "Basics of Budgeting" module. Now showing interest in digital literacy for freelance work.',
                78,
                ['Digital Skills', 'Embroidery', 'Financial Literacy']
            ]
        );

        // 3. Reseed Courses (Clear old ones to avoid dupes/mess)
        console.log('Seeding courses...');
        await client.query('DELETE FROM user_courses WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM courses');

        const courses = [
            {
                title: 'Introduction to Mobile Photography',
                desc: 'Learn to take professional product photos using just your phone.',
                difficulty: 1,
                duration: '2 hours',
                category: 'Digital Skills',
                url: 'https://youtu.be/example1'
            },
            {
                title: 'Hand Embroidery Basics',
                desc: 'Master basic stitches for traditional patterns.',
                difficulty: 1,
                duration: '1 week',
                category: 'Crafts',
                url: 'https://youtu.be/example2'
            },
            {
                title: 'Spoken English for Beginners',
                desc: 'Daily phrases for confidence in communication.',
                difficulty: 2,
                duration: '4 weeks',
                category: 'Language',
                url: 'https://youtu.be/example3'
            },
            {
                title: 'Freelancing 101: Selling on Facebook',
                desc: 'How to create a business page and sell your crafts.',
                difficulty: 3,
                duration: '2 weeks',
                category: 'Freelancing',
                url: 'https://youtu.be/example4'
            },
            {
                title: 'Basic Home Budgeting',
                desc: 'Manage household expenses and savings effectively.',
                difficulty: 1,
                duration: '3 hours',
                category: 'Financial Literacy',
                url: 'https://youtu.be/example5'
            }
        ];

        for (const c of courses) {
            await client.query(
                `INSERT INTO courses (title, description, difficulty_level, duration_estimate, category, source_url, offline_available)
                 VALUES ($1, $2, $3, $4, $5, $6, true)`,
                [c.title, c.desc, c.difficulty, c.duration, c.category, c.url]
            );
        }

        await client.query('COMMIT');
        console.log('✅ Demo Data Seeded Successfully!');
        console.log(`User: ${email}`);
        console.log(`Pass: demo123`);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', e);
    } finally {
        client.release();
        // Since we imported pool, we should check if we can end it or if it's shared.
        // It's a script, so ending it is fine.
        await pool.end();
    }
}

seedDemoData();
