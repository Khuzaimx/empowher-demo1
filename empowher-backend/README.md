# EmpowHer Backend

Privacy-first, research-grounded emotional wellness and skill growth platform API.

## Features

- 🔐 **Secure Authentication**: JWT-based auth with httpOnly cookies.
- 🔒 **Privacy First**: AES-256-GCM encryption for all sensitive journal entries.
- � **Research-Grounded**: Implements clinically validated screening tools:
  - **PHQ-2** (Depression Screening)
  - **GAD-2** (Anxiety Screening)
  - **WHO-5** (Wellbeing Index)
- 🤖 **Multi-Agent Orchestration**:
  - **CrisisAgent**: Detects immediate risk and activates protocols.
  - **ResearchGroundedEmotionalAgent**: Analyzes scores and provides insights.
  - **EvidenceBasedInterventionAgent**: Recommends CBT/DBT-based activities.
  - **EthicsGuardAgent**: Ensures cultural safety and appropriateness.
- 📊 **Analytics & Trends**: Tracks emotional history and visualizes progress.
- 🚨 **Crisis Protocol**: Automated escalation for high-risk detection.

## Prerequisites

- Node.js 16+ 
- PostgreSQL 15+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create PostgreSQL database:
```bash
createdb empowher
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL` with your PostgreSQL connection string
- `JWT_SECRET` with a secure random string
- `ENCRYPTION_KEY` with a 64-character hex string (32 bytes)
- `FRONTEND_URL` for CORS configuration (e.g., http://localhost:3000)

4. Run database migrations:
```bash
psql -U postgres -d empowher -f migrations/001_initial_schema.sql
psql -U postgres -d empowher -f migrations/002_agent_system.sql
psql -U postgres -d empowher -f migrations/003_research_instruments.sql
```

5. Seed database with sample data:
```bash
psql -U postgres -d empowher -f seeds/001_seed_data.sql
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Emotional Tracking (Research-Grounded)
- `POST /api/emotional/checkin` - Submit daily check-in (PHQ-2, GAD-2, WHO-5)
- `GET /api/emotional/history` - Get emotional history with screened scores
- `GET /api/emotional/current-level` - Get current emotional level and insights
- `GET /api/emotional/entry/:id` - Get specific entry details

### Skills & Interventions
- `GET /api/skills/recommended` - Get personalized recommendations based on emotional state
- `GET /api/skills/:id` - Get skill module details
- `POST /api/skills/:id/start` - Start a skill module
- `PUT /api/skills/:id/progress` - Update progress

### User Data
- `GET /api/user/dashboard` - Get dashboard overview
- `GET /api/user/export` - Download all user data
- `DELETE /api/user/account` - Permanently delete account

## Database Schema

### Core Tables
- `users`: User accounts and preferences
- `emotional_entries`: 
  - Stores encrypted journal entries
  - Stores validated scores (PHQ-2, GAD-2, WHO-5)
  - Stores calculated risk flags (depression_risk, anxiety_risk)
- `interest_tags`: User interests tagged in check-ins
- `user_consents`: GDPR/Privacy consent tracking

### Agent System Tables
- `user_memory`: Short-term and long-term user context
- `agent_decisions`: Log of all AI agent decisions and reasoning
- `intervention_outcomes`: Effectiveness tracking of recommended interventions

## Security Architecture

1. **At Rest**: 
   - Journal entries are encrypted using AES-256-GCM before storage.
   - Encryption keys are managed via environment variables.
   
2. **In Transit**:
   - All API communication over HTTPS (in production).
   - Secure, HttpOnly, SameSite cookies for JWT.

3. **Application**:
   - Rate limiting on all endpoints.
   - Input validation using express-validator.
   - Helmet headers for web security.

## License

ISC
