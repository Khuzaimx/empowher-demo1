-- Migration: 003_demo_mode
-- Description: Add tables for demo simulation and course recommendations

BEGIN;

-- 1. Add is_demo flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- 2. Create demo_profiles table for simulated history
CREATE TABLE IF NOT EXISTS demo_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    village VARCHAR(255),
    initial_stage VARCHAR(50), -- e.g., 'distress', 'struggling'
    current_stage VARCHAR(50),
    emotional_progression_summary TEXT,
    skill_progression_summary TEXT,
    engagement_score INTEGER DEFAULT 0,
    interest_tags TEXT[], -- array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create courses table for static learning resources
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5), -- 1=Easy, 5=Advanced
    duration_estimate VARCHAR(50), -- e.g., '2 hours', '1 week'
    category VARCHAR(100), -- e.g., 'Digital Literacy', 'Crafts'
    source_url TEXT,
    offline_available BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create user_courses table for tracking progress
CREATE TABLE IF NOT EXISTS user_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    completion_status VARCHAR(50) DEFAULT 'not_started', -- 'in_progress', 'completed'
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

COMMIT;
