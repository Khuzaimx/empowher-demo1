const db = require('../config/database');
const { buildCrisisResponse } = require('../services/crisisProtocol');

/**
 * Get crisis helplines by region
 */
const getHelplines = async (req, res) => {
    try {
        const { region } = req.query;

        let query = 'SELECT * FROM crisis_helplines WHERE is_active = true';
        const params = [];

        if (region) {
            query += ' AND region = $1';
            params.push(region);
        }

        query += ' ORDER BY region, name';

        const result = await db.query(query, params);

        const response = buildCrisisResponse(result.rows);

        res.json(response);
    } catch (error) {
        console.error('Get crisis helplines error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getHelplines
};
