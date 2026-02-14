-- Complete Database Setup Script for EmpowHer
-- Run this with: psql -U postgres -f setup_database.sql

-- Create database
DROP DATABASE IF EXISTS empowher;
CREATE DATABASE empowher;

-- Connect to the database
\c empowher

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run initial schema migration
\i migrations/001_initial_schema.sql

-- Run agent system migration
\i migrations/002_agent_system.sql

-- Run seed data
\i seeds/001_seed_data.sql

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

\echo 'Database setup complete!'
