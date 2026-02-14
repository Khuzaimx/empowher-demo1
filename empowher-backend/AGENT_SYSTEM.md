# Multi-Agent Orchestration System

## Overview

EmpowHer implements a **sophisticated multi-agent AI system** that demonstrates true agentic behavior through autonomous decision-making, hierarchical priority, memory management, and continuous learning via reflection loops.

## Agent Architecture

### Agent Hierarchy (Priority Order)

The system uses a **priority-based agent hierarchy** where higher-priority agents can override lower-priority agents:

1. **CrisisAgent** (Priority 1) - Highest priority, overrides all others
2. **EmotionalInsightAgent** (Priority 2) - Analyzes emotional patterns
3. **AdaptiveInterventionAgent** (Priority 3) - Recommends wellness activities
4. **SkillGrowthAgent** (Priority 4) - Suggests skill-building (only when stable)

### Agent Orchestrator

The `AgentOrchestrator` is the central coordination layer that:
- Manages agent execution in priority order
- Loads user memory before agent decisions
- Logs all agent decisions with confidence scores
- Updates long-term memory trends
- Coordinates the reflection loop

## Agent Capabilities

### 1. CrisisAgent (Priority 1)

**Purpose**: Detect and respond to crisis situations immediately

**Decision Logic**:
- Triggers when `mood_score <= 3` AND `stress_level === 'high'`
- Analyzes historical pattern for escalating crises
- Loads crisis helplines when activated
- Confidence: 0.95 when crisis detected, 0.0 otherwise

**Actions**:
- Show crisis modal
- Load helplines
- Notify support system

### 2. EmotionalInsightAgent (Priority 2)

**Purpose**: Classify emotional state and analyze trends

**Decision Logic**:
- Classifies emotional level (red/orange/yellow/green)
- Analyzes 7-day and 14-day trends
- Calculates trend direction (improving/stable/declining)
- Determines if user is emotionally stable for skill growth

**Confidence Calculation**:
- 0-2 data points: 0.3-0.5
- 3-4 data points: 0.7
- 5+ data points: 0.9

**Output**:
- Emotional level classification
- Trend analysis
- Personalized insights
- Encouragement messages

### 3. AdaptiveInterventionAgent (Priority 3)

**Purpose**: Recommend wellness interventions based on emotional state and past success

**Decision Logic**:
- Gets base interventions for current emotional level
- Retrieves past 20 intervention outcomes
- Ranks interventions by personal success rate
- Adjusts for energy level (filters high-duration activities if low energy)

**Learning Mechanism**:
- Calculates success rate per intervention type
- Prioritizes interventions with higher past success
- Uses 50% default success rate for untried interventions

**Confidence Calculation**:
- 0 outcomes: 0.5
- 1-4 outcomes: 0.6
- 5-9 outcomes: 0.75
- 10+ outcomes: 0.9

### 4. SkillGrowthAgent (Priority 4)

**Purpose**: Recommend skill modules when user is emotionally stable

**Activation Criteria**:
- Only activates if `emotionalLevel === 'green' || 'yellow'`
- Skipped entirely if user is in red/orange state

**Decision Logic**:
- Analyzes user's skill completion history
- Identifies preferred categories from interests + completed skills
- Adjusts difficulty based on completion count:
  - 0-4 completed: beginner
  - 5-9 completed: intermediate
  - 10+ completed: advanced
- Filters by max duration based on energy level

**Confidence Calculation**:
- 0 skills: 0.5
- 1-2 skills: 0.6
- 3-4 skills: 0.75
- 5+ skills: 0.9

## Memory System

### Short-Term Memory
- **Storage**: Last 7 days of emotional entries
- **Source**: `emotional_entries` table
- **Usage**: Trend analysis, pattern detection

### Long-Term Memory
- **Storage**: `user_memory` table
- **Fields**:
  - `long_term_summary`: 30-day aggregated stats (avg mood, consistency)
  - `trend_direction`: improving/stable/declining/insufficient_data
  - `engagement_score`: 0-100 based on check-ins and skill completion

### Engagement Score Calculation
- **Check-ins**: 2 points each (max 60 points for 30 check-ins)
- **Completed Skills**: 4 points each (max 40 points for 10 skills)
- **Total**: 0-100 scale

## Decision Logging

Every agent decision is logged to `agent_decisions` table with:
- **input_summary**: What data the agent received
- **decision_output**: What the agent decided
- **confidence_score**: 0.00-1.00
- **reasoning**: Why the agent made this decision

This provides full transparency and auditability of agent behavior.

## Reflection Loop

### Outcome Tracking

Users provide feedback on interventions via:
- **Completion**: Did they complete the activity?
- **Rating**: 1-5 stars
- **Time**: How long it took

### Confidence Adjustment

When a user rates an intervention:
- **Rating 5**: +0.10 confidence
- **Rating 4**: +0.05 confidence
- **Rating 3**: No change
- **Rating 2**: -0.05 confidence
- **Rating 1**: -0.10 confidence

Adjustments are stored in `agent_confidence_adjustments` for tracking learning over time.

### Continuous Improvement

The `AdaptiveInterventionAgent` uses past outcomes to:
1. Calculate success rate per intervention type
2. Rank interventions by personal effectiveness
3. Prioritize what works for each individual user

This creates a **personalized feedback loop** where the system learns what works best for each user.

## API Endpoints

### Agent System Endpoints

```
POST   /api/agents/outcomes        - Record intervention outcome
GET    /api/agents/decisions       - Get agent decision history
GET    /api/agents/memory          - Get user memory and trends
GET    /api/agents/analytics       - Get intervention success analytics
```

### Enhanced Check-in Response

When submitting a check-in via `POST /api/emotional/checkin`, the response now includes:

```json
{
  "entry": { "id": "...", "emotional_level": "yellow" },
  "emotionalLevel": "yellow",
  "insights": [
    "Your mood is moderate 😐",
    "Your mood is improving! 📈",
    "Keep up the great work! 🌟"
  ],
  "encouragement": "You're making progress...",
  "trend": "improving",
  "immediateActions": [
    {
      "type": "mindful_walk",
      "priority": 1,
      "title": "Mindful Walk",
      "description": "Take a short walk with awareness",
      "expectedDuration": 15
    }
  ],
  "skillRecommendations": [...],
  "agentDecisions": {
    "emotional": {
      "confidence": 0.9,
      "reasoning": "Classified as yellow based on mood=6..."
    },
    "intervention": {
      "confidence": 0.75,
      "reasoning": "Selected 3 interventions..."
    },
    "skill": {
      "confidence": 0.8,
      "reasoning": "Recommended 5 skills..."
    }
  }
}
```

## Database Schema

### New Tables

**user_memory**
- Stores short-term summary, long-term trends, engagement score
- Auto-created when user signs up (via trigger)

**agent_decisions**
- Logs every agent decision with full context
- Indexed by user_id, agent_name, created_at

**intervention_outcomes**
- Tracks user completion and feedback
- Links to agent_decisions for reflection loop

**agent_confidence_adjustments**
- Historical record of confidence changes
- Used to track agent learning over time

## Demonstrating Agentic AI

This system demonstrates **true agentic behavior** through:

1. **Autonomy**: Agents make decisions independently based on data
2. **Hierarchy**: Priority system allows intelligent override behavior
3. **Memory**: Both short-term (7 days) and long-term (30 days) memory
4. **Learning**: Reflection loop adjusts confidence based on outcomes
5. **Personalization**: Recommendations adapt to individual user patterns
6. **Transparency**: All decisions logged with reasoning
7. **Coordination**: Orchestrator manages complex multi-agent interactions

This goes far beyond simple rule-based systems, showcasing sophisticated AI decision-making that learns and adapts to each user's unique needs.
