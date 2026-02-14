-- Multi-Agent Orchestration System Schema Extensions
-- Add these tables to support agent decision-making and memory

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Memory Table (Short-term and Long-term memory per user)
CREATE TABLE user_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    short_term_summary JSONB DEFAULT '[]'::jsonb,
    long_term_summary JSONB DEFAULT '{}'::jsonb,
    trend_direction VARCHAR(20) DEFAULT 'insufficient_data' CHECK (trend_direction IN ('improving', 'stable', 'declining', 'insufficient_data')),
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score BETWEEN 0 AND 100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Decisions Table (Logs all agent decisions with reasoning)
CREATE TABLE agent_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    input_summary JSONB NOT NULL,
    decision_output JSONB NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Intervention Outcomes Table (Tracks user completion and feedback)
CREATE TABLE intervention_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision_id UUID REFERENCES agent_decisions(id) ON DELETE CASCADE,
    recommended_action VARCHAR(255) NOT NULL,
    user_completed BOOLEAN DEFAULT false,
    outcome_rating INTEGER CHECK (outcome_rating BETWEEN 1 AND 5),
    time_to_complete INTEGER,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Confidence Adjustments Table (Tracks learning over time)
CREATE TABLE agent_confidence_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(100) NOT NULL,
    original_confidence DECIMAL(3,2) NOT NULL,
    adjusted_confidence DECIMAL(3,2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_user_memory_user_id ON user_memory(user_id);
CREATE INDEX idx_agent_decisions_user_id ON agent_decisions(user_id);
CREATE INDEX idx_agent_decisions_agent_name ON agent_decisions(agent_name);
CREATE INDEX idx_agent_decisions_created_at ON agent_decisions(created_at DESC);
CREATE INDEX idx_intervention_outcomes_user_id ON intervention_outcomes(user_id);
CREATE INDEX idx_intervention_outcomes_decision_id ON intervention_outcomes(decision_id);
CREATE INDEX idx_intervention_outcomes_completed ON intervention_outcomes(user_completed, outcome_rating);

-- Trigger to automatically create user_memory when user is created
CREATE OR REPLACE FUNCTION create_user_memory()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_memory (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_memory
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_memory();
