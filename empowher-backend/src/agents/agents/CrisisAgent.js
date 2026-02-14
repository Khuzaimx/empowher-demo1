const db = require('../../config/database');

/**
 * Crisis Agent (Priority 1)
 * Highest priority agent that overrides all others when crisis is detected
 */
class CrisisAgent {
    /**
     * Analyze user state for crisis indicators
     */
    async analyze({ userId, checkinData, memory }) {
        const { mood_score, stress_level } = checkinData;

        // Critical risk detection
        const isCritical = mood_score <= 3 && stress_level === 'high';

        // Check historical pattern - multiple crisis entries recently
        const recentCrisisCount = memory.shortTerm.filter(
            entry => entry.emotional_level === 'red'
        ).length;

        // Escalate if multiple crisis entries in short period
        const isEscalating = recentCrisisCount >= 2;

        // High confidence when clear crisis indicators
        const confidence = isCritical ? 0.95 : 0.0;

        // Load crisis helplines if activating
        let helplines = [];
        if (isCritical) {
            const helplinesResult = await db.query(
                'SELECT * FROM crisis_helplines WHERE is_active = true ORDER BY region, name'
            );
            helplines = helplinesResult.rows;
        }

        return {
            shouldActivate: isCritical,
            confidence,
            input: {
                mood_score,
                stress_level,
                recentCrisisCount,
                isEscalating
            },
            output: {
                riskLevel: isCritical ? 'CRITICAL' : 'LOW',
                requiresImmediate: isCritical,
                escalating: isEscalating,
                helplines: helplines.map(h => ({
                    name: h.name,
                    phoneNumber: h.phone_number,
                    description: h.description,
                    region: h.region
                }))
            },
            actions: isCritical ? [
                { type: 'SHOW_CRISIS_MODAL', priority: 1, data: { escalating: isEscalating } },
                { type: 'LOAD_HELPLINES', priority: 1, data: { helplines } },
                { type: 'NOTIFY_SUPPORT', priority: 2, data: { userId, severity: 'critical' } }
            ] : [],
            reasoning: isCritical
                ? `Critical risk detected: mood=${mood_score}, stress=${stress_level}. Recent crisis count: ${recentCrisisCount}. ${isEscalating ? 'ESCALATING PATTERN DETECTED.' : ''}`
                : `No immediate crisis detected. Mood=${mood_score}, stress=${stress_level}`
        };
    }
}

module.exports = CrisisAgent;
