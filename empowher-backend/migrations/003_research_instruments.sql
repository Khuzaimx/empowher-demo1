-- Research-Grounded System Upgrade: Database Schema Extensions
-- Adds support for PHQ-2, GAD-2, WHO-5 instruments and rural-first features

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: Extend emotional_entries table with research instruments
-- ============================================================================

-- Add research-based assessment scores
ALTER TABLE emotional_entries 
ADD COLUMN phq2_q1_score INTEGER CHECK (phq2_q1_score BETWEEN 0 AND 3),
ADD COLUMN phq2_q2_score INTEGER CHECK (phq2_q2_score BETWEEN 0 AND 3),
ADD COLUMN phq2_total_score INTEGER CHECK (phq2_total_score BETWEEN 0 AND 6),
ADD COLUMN gad2_q1_score INTEGER CHECK (gad2_q1_score BETWEEN 0 AND 3),
ADD COLUMN gad2_q2_score INTEGER CHECK (gad2_q2_score BETWEEN 0 AND 3),
ADD COLUMN gad2_total_score INTEGER CHECK (gad2_total_score BETWEEN 0 AND 6),
ADD COLUMN who5_q1_score INTEGER CHECK (who5_q1_score BETWEEN 0 AND 5),
ADD COLUMN who5_q2_score INTEGER CHECK (who5_q2_score BETWEEN 0 AND 5),
ADD COLUMN who5_q3_score INTEGER CHECK (who5_q3_score BETWEEN 0 AND 5),
ADD COLUMN who5_total_score INTEGER CHECK (who5_total_score BETWEEN 0 AND 100);

-- Add risk flags and probability scores
ALTER TABLE emotional_entries
ADD COLUMN depression_risk_flag BOOLEAN DEFAULT false,
ADD COLUMN anxiety_risk_flag BOOLEAN DEFAULT false,
ADD COLUMN risk_probability_score DECIMAL(3,2) CHECK (risk_probability_score BETWEEN 0 AND 1);

-- Add sentiment analysis for journal entries
ALTER TABLE emotional_entries
ADD COLUMN journal_sentiment_score DECIMAL(3,2) CHECK (journal_sentiment_score BETWEEN -1 AND 1),
ADD COLUMN journal_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN journal_word_count INTEGER DEFAULT 0;

-- Add simplified explanation for users
ALTER TABLE emotional_entries
ADD COLUMN simplified_explanation TEXT;

-- ============================================================================
-- PART 2: Extend users table for rural context
-- ============================================================================

ALTER TABLE users
ADD COLUMN education_level VARCHAR(50) CHECK (education_level IN ('none', 'primary', 'secondary', 'higher_secondary', 'university', 'other')),
ADD COLUMN device_capability VARCHAR(20) DEFAULT 'basic' CHECK (device_capability IN ('basic', 'smartphone', 'tablet')),
ADD COLUMN internet_stability VARCHAR(20) DEFAULT 'low' CHECK (internet_stability IN ('low', 'medium', 'high')),
ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'ur' CHECK (preferred_language IN ('ur', 'en', 'ur_en')),
ADD COLUMN age_range VARCHAR(20) CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55+')),
ADD COLUMN location_type VARCHAR(20) DEFAULT 'rural' CHECK (location_type IN ('rural', 'semi_urban', 'urban'));

-- ============================================================================
-- PART 3: Extend user_memory for dropout prediction
-- ============================================================================

ALTER TABLE user_memory
ADD COLUMN dropout_risk_score DECIMAL(3,2) DEFAULT 0 CHECK (dropout_risk_score BETWEEN 0 AND 1),
ADD COLUMN last_activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN check_in_consistency_score INTEGER DEFAULT 0 CHECK (check_in_consistency_score BETWEEN 0 AND 100),
ADD COLUMN skill_completion_rate DECIMAL(3,2) DEFAULT 0 CHECK (skill_completion_rate BETWEEN 0 AND 1),
ADD COLUMN emotional_volatility_score DECIMAL(3,2) DEFAULT 0;

-- ============================================================================
-- PART 4: Extend intervention_outcomes for effectiveness tracking
-- ============================================================================

ALTER TABLE intervention_outcomes
ADD COLUMN improvement_delta DECIMAL(5,2),
ADD COLUMN phq2_before INTEGER CHECK (phq2_before BETWEEN 0 AND 6),
ADD COLUMN phq2_after INTEGER CHECK (phq2_after BETWEEN 0 AND 6),
ADD COLUMN gad2_before INTEGER CHECK (gad2_before BETWEEN 0 AND 6),
ADD COLUMN gad2_after INTEGER CHECK (gad2_after BETWEEN 0 AND 6),
ADD COLUMN who5_before INTEGER CHECK (who5_before BETWEEN 0 AND 100),
ADD COLUMN who5_after INTEGER CHECK (who5_after BETWEEN 0 AND 100),
ADD COLUMN intervention_type VARCHAR(100),
ADD COLUMN cognitive_load_level VARCHAR(20) CHECK (cognitive_load_level IN ('low', 'medium', 'high'));

-- ============================================================================
-- PART 5: Extend agent_decisions for ethics tracking
-- ============================================================================

ALTER TABLE agent_decisions
ADD COLUMN ethical_adjustment TEXT,
ADD COLUMN cognitive_load_level VARCHAR(20) CHECK (cognitive_load_level IN ('low', 'medium', 'high')),
ADD COLUMN cultural_sensitivity_check BOOLEAN DEFAULT true,
ADD COLUMN language_simplified BOOLEAN DEFAULT false;

-- ============================================================================
-- PART 6: Extend skill_modules for rural focus
-- ============================================================================

ALTER TABLE skill_modules
ADD COLUMN requires_internet BOOLEAN DEFAULT true,
ADD COLUMN min_education_level VARCHAR(50) DEFAULT 'none',
ADD COLUMN cognitive_load VARCHAR(20) DEFAULT 'medium' CHECK (cognitive_load IN ('low', 'medium', 'high')),
ADD COLUMN cultural_context VARCHAR(50) DEFAULT 'rural_pakistan',
ADD COLUMN language_available VARCHAR(20)[] DEFAULT ARRAY['en'],
ADD COLUMN offline_capable BOOLEAN DEFAULT false;

-- ============================================================================
-- PART 7: Create new table for research instrument responses
-- ============================================================================

CREATE TABLE research_instrument_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES emotional_entries(id) ON DELETE CASCADE,
    instrument_type VARCHAR(20) NOT NULL CHECK (instrument_type IN ('PHQ2', 'GAD2', 'WHO5')),
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    response_value INTEGER NOT NULL,
    response_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entry_id, instrument_type, question_number)
);

-- ============================================================================
-- PART 8: Create table for language simplification cache
-- ============================================================================

CREATE TABLE language_simplification_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_text TEXT NOT NULL,
    simplified_text TEXT NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    education_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 1,
    UNIQUE(original_text, target_language, education_level)
);

-- ============================================================================
-- PART 9: Create table for dropout prediction history
-- ============================================================================

CREATE TABLE dropout_prediction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dropout_risk_score DECIMAL(3,2) NOT NULL,
    check_in_consistency INTEGER,
    skill_completion_rate DECIMAL(3,2),
    emotional_volatility DECIMAL(3,2),
    days_since_last_activity INTEGER,
    prediction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PART 10: Create indexes for performance
-- ============================================================================

CREATE INDEX idx_emotional_entries_phq2_score ON emotional_entries(phq2_total_score);
CREATE INDEX idx_emotional_entries_gad2_score ON emotional_entries(gad2_total_score);
CREATE INDEX idx_emotional_entries_who5_score ON emotional_entries(who5_total_score);
CREATE INDEX idx_emotional_entries_risk_flags ON emotional_entries(depression_risk_flag, anxiety_risk_flag);
CREATE INDEX idx_research_responses_entry ON research_instrument_responses(entry_id);
CREATE INDEX idx_research_responses_instrument ON research_instrument_responses(instrument_type);
CREATE INDEX idx_dropout_history_user ON dropout_prediction_history(user_id);
CREATE INDEX idx_dropout_history_timestamp ON dropout_prediction_history(prediction_timestamp DESC);
CREATE INDEX idx_users_education_level ON users(education_level);
CREATE INDEX idx_users_preferred_language ON users(preferred_language);

-- ============================================================================
-- PART 11: Create views for admin analytics
-- ============================================================================

-- View for wellbeing trends (no PII)
CREATE OR REPLACE VIEW admin_wellbeing_trends AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_checkins,
    AVG(phq2_total_score) as avg_phq2,
    AVG(gad2_total_score) as avg_gad2,
    AVG(who5_total_score) as avg_who5,
    COUNT(CASE WHEN depression_risk_flag THEN 1 END) as depression_risk_count,
    COUNT(CASE WHEN anxiety_risk_flag THEN 1 END) as anxiety_risk_count,
    COUNT(CASE WHEN emotional_level = 'red' THEN 1 END) as crisis_count
FROM emotional_entries
WHERE phq2_total_score IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- View for intervention effectiveness (no PII)
CREATE OR REPLACE VIEW admin_intervention_effectiveness AS
SELECT 
    intervention_type,
    COUNT(*) as total_interventions,
    COUNT(CASE WHEN user_completed THEN 1 END) as completed_count,
    AVG(outcome_rating) as avg_rating,
    AVG(improvement_delta) as avg_improvement,
    AVG(time_to_complete) as avg_time_minutes
FROM intervention_outcomes
WHERE user_completed = true
GROUP BY intervention_type
ORDER BY avg_improvement DESC NULLS LAST;

-- View for engagement metrics (no PII)
CREATE OR REPLACE VIEW admin_engagement_metrics AS
SELECT 
    DATE_TRUNC('week', last_activity_timestamp) as week,
    COUNT(*) as active_users,
    AVG(engagement_score) as avg_engagement,
    AVG(dropout_risk_score) as avg_dropout_risk,
    AVG(check_in_consistency_score) as avg_consistency,
    AVG(skill_completion_rate) as avg_skill_completion
FROM user_memory
WHERE last_activity_timestamp IS NOT NULL
GROUP BY DATE_TRUNC('week', last_activity_timestamp)
ORDER BY week DESC;

-- ============================================================================
-- PART 12: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN emotional_entries.phq2_total_score IS 'PHQ-2 depression screening score (0-6). Score ≥3 indicates depression risk.';
COMMENT ON COLUMN emotional_entries.gad2_total_score IS 'GAD-2 anxiety screening score (0-6). Score ≥3 indicates anxiety risk.';
COMMENT ON COLUMN emotional_entries.who5_total_score IS 'WHO-5 wellbeing index (0-100). Lower scores indicate lower wellbeing.';
COMMENT ON COLUMN emotional_entries.risk_probability_score IS 'AI-calculated probability of mental health risk (0-1).';
COMMENT ON COLUMN users.education_level IS 'User education level for content adaptation.';
COMMENT ON COLUMN users.preferred_language IS 'ur=Urdu, en=English, ur_en=Both';
COMMENT ON COLUMN intervention_outcomes.improvement_delta IS 'Change in wellbeing score after intervention (positive = improvement).';

-- ============================================================================
-- Migration complete
-- ============================================================================
