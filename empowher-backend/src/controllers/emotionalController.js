const db = require('../config/database');
const { classifyEmotionalLevel, getEncouragementMessage, shouldTriggerCrisisProtocol } = require('../services/emotionalClassifier');
const { prepareJournalForStorage, reconstructEncryptedData, decryptJournal } = require('../services/encryptionService');
const { buildCrisisResponse } = require('../services/crisisProtocol');
const AgentOrchestrator = require('../agents/AgentOrchestrator');

/**
 * Submit daily emotional check-in
 * Now powered by multi-agent orchestration system
 */
const submitCheckin = async (req, res) => {
    try {
        const checkinData = req.body;
        const userId = req.user.id;

        // Use Agent Orchestrator for intelligent processing
        const orchestrator = new AgentOrchestrator();
        const result = await orchestrator.processCheckin(userId, checkinData);

        // Build response based on agent decisions
        const response = {
            entry: {
                id: result.entryId,
                emotional_level: result.emotionalLevel,
                created_at: new Date()
            },
            emotionalLevel: result.emotionalLevel,
            insights: result.insights,
            encouragement: result.encouragement,
            trend: result.trend,
            immediateActions: result.immediateActions,
            skillRecommendations: result.skillRecommendations,
            agentDecisions: result.agentDecisions,
            trigger_crisis: result.crisisProtocol || false
        };

        // If crisis protocol activated, include crisis data
        if (result.crisisProtocol) {
            response.crisis_support = result.crisisData;
            response.priority = result.priority;
        }

        res.status(201).json(response);
    } catch (error) {
        console.error('Check-in submission error:', error);
        res.status(500).json({ error: 'Server error during check-in' });
    }
};


/**
 * Get emotional history (last 7 days)
 */
const getEmotionalHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 7;

        const result = await db.query(
            `SELECT id, mood_score, energy_level, stress_level, emotional_level, 
                    phq2_total_score, gad2_total_score, who5_total_score,
                    depression_risk_flag, anxiety_risk_flag, risk_probability_score,
                    created_at
       FROM emotional_entries
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
       ORDER BY created_at ASC`, // Order by ASC for charts (oldest to newest)
            [userId]
        );

        res.json({ entries: result.rows, count: result.rows.length });
    } catch (error) {
        console.error('Get emotional history error:', error);
        res.status(500).json({ error: 'Server error fetching history' });
    }
};

/**
 * Get current emotional level
 */
const getCurrentLevel = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT emotional_level, mood_score, created_at
       FROM emotional_entries
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                emotional_level: null,
                message: 'No check-ins yet. Complete your first check-in to get started!'
            });
        }

        const entry = result.rows[0];

        res.json({
            emotional_level: entry.emotional_level,
            mood_score: entry.mood_score,
            last_checkin: entry.created_at,
            encouragement: getEncouragementMessage(entry.emotional_level)
        });
    } catch (error) {
        console.error('Get current level error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get specific entry with decrypted journal
 */
const getEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            `SELECT * FROM emotional_entries WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        const entry = result.rows[0];

        // Decrypt journal if exists
        let journal = null;
        if (entry.journal_encrypted) {
            const encryptedData = reconstructEncryptedData(entry);
            journal = decryptJournal(encryptedData);
        }

        // Get interest tags
        const tagsResult = await db.query(
            'SELECT tag FROM interest_tags WHERE entry_id = $1',
            [id]
        );

        res.json({
            entry: {
                id: entry.id,
                mood_score: entry.mood_score,
                energy_level: entry.energy_level,
                stress_level: entry.stress_level,
                emotional_level: entry.emotional_level,
                journal,
                interests: tagsResult.rows.map(r => r.tag),
                created_at: entry.created_at
            }
        });
    } catch (error) {
        console.error('Get entry error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    submitCheckin,
    getEmotionalHistory,
    getCurrentLevel,
    getEntry
};
