# Database Setup Guide

## Quick Setup

Run this single command to set up the complete database:

```powershell
# Windows PowerShell
$env:PGPASSWORD="your_password"; psql -U postgres -f setup_database.sql; Remove-Item Env:\PGPASSWORD
```

Or run step-by-step:

### Step 1: Create Database

```powershell
psql -U postgres
```

Then in psql:
```sql
DROP DATABASE IF EXISTS empowher;
CREATE DATABASE empowher;
\c empowher
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### Step 2: Run Initial Schema

```powershell
psql -U postgres empowher -f migrations/001_initial_schema.sql
```

### Step 3: Run Agent System Schema

```powershell
psql -U postgres empowher -f migrations/002_agent_system.sql
```

### Step 4: Seed Data

```powershell
psql -U postgres empowher -f seeds/001_seed_data.sql
```

### Step 5: Verify

```powershell
psql -U postgres empowher -c "\dt"
```

You should see these tables:
- `users`
- `emotional_entries`
- `interest_tags`
- `skill_modules`
- `user_skill_progress`
- `crisis_helplines`
- `user_consents`
- **`user_memory`** (new)
- **`agent_decisions`** (new)
- **`intervention_outcomes`** (new)
- **`agent_confidence_adjustments`** (new)

## Alternative: Using Environment Variable

```powershell
# Set password as environment variable
$env:PGPASSWORD="your_password"

# Run all migrations
psql -U postgres -c "DROP DATABASE IF EXISTS empowher"
psql -U postgres -c "CREATE DATABASE empowher"
psql -U postgres empowher -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""
psql -U postgres empowher -f migrations/001_initial_schema.sql
psql -U postgres empowher -f migrations/002_agent_system.sql
psql -U postgres empowher -f seeds/001_seed_data.sql

# Clear password
Remove-Item Env:\PGPASSWORD
```

## Troubleshooting

### Error: "database empowher does not exist"
**Solution**: Create the database first:
```powershell
psql -U postgres -c "CREATE DATABASE empowher"
```

### Error: "function uuid_generate_v4() does not exist"
**Solution**: Enable the UUID extension:
```powershell
psql -U postgres empowher -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""
```

### Error: "relation users does not exist"
**Solution**: Run migrations in order:
1. First: `001_initial_schema.sql`
2. Then: `002_agent_system.sql`

## Verify Agent Tables

After setup, verify the agent tables were created:

```powershell
psql -U postgres empowher -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%agent%' OR table_name = 'user_memory' OR table_name LIKE '%outcome%' ORDER BY table_name"
```

Expected output:
```
 table_name
---------------------------------
 agent_confidence_adjustments
 agent_decisions
 intervention_outcomes
 user_memory
```

## Test Agent System

After setup, you can test the agent system by:

1. Starting the server:
```powershell
npm run dev
```

2. Creating a test user and submitting a check-in via the API

3. Querying agent decisions:
```powershell
psql -U postgres empowher -c "SELECT agent_name, confidence_score, created_at FROM agent_decisions ORDER BY created_at DESC LIMIT 5"
```
