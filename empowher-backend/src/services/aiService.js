/**
 * AI Service Integration Layer
 * Provides AI capabilities for sentiment analysis, language simplification,
 * and pattern detection
 */

/**
 * CONFIGURATION
 * Set AI_PROVIDER in .env to one of: 'openai', 'gemini', 'local', 'mock'
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Analyze sentiment of journal text
 * @param {string} text - Journal entry text
 * @param {string} language - Language code ('en', 'ur')
 * @returns {Promise<Object>} - { score: number (-1 to 1), magnitude: number, emotions: string[] }
 */
async function analyzeSentiment(text, language = 'en') {
    if (!text || text.trim().length === 0) {
        return { score: 0, magnitude: 0, emotions: [] };
    }

    switch (AI_PROVIDER) {
        case 'openai':
            return await analyzeSentimentOpenAI(text, language);
        case 'gemini':
            return await analyzeSentimentGemini(text, language);
        case 'local':
            return await analyzeSentimentLocal(text, language);
        default:
            return await analyzeSentimentMock(text, language);
    }
}

/**
 * Simplify psychological/medical language to Grade 5 level
 * @param {string} text - Original text with complex terms
 * @param {string} targetLanguage - 'en' or 'ur'
 * @param {string} educationLevel - User's education level
 * @returns {Promise<string>} - Simplified text
 */
async function simplifyLanguage(text, targetLanguage = 'en', educationLevel = 'primary') {
    if (!text || text.trim().length === 0) {
        return text;
    }

    // Check cache first
    const cached = await checkSimplificationCache(text, targetLanguage, educationLevel);
    if (cached) {
        return cached;
    }

    let simplified;
    switch (AI_PROVIDER) {
        case 'openai':
            simplified = await simplifyLanguageOpenAI(text, targetLanguage, educationLevel);
            break;
        case 'gemini':
            simplified = await simplifyLanguageGemini(text, targetLanguage, educationLevel);
            break;
        default:
            simplified = await simplifyLanguageFallback(text, targetLanguage);
    }

    // Cache the result
    await cacheSimplification(text, simplified, targetLanguage, educationLevel);

    return simplified;
}

/**
 * Predict dropout risk using AI pattern detection
 * @param {Object} userData - User engagement data
 * @returns {Promise<number>} - Dropout risk score (0-1)
 */
async function predictDropoutRisk(userData) {
    const {
        checkInConsistency,
        skillCompletionRate,
        emotionalVolatility,
        daysSinceLastActivity
    } = userData;

    // Simple heuristic model (can be replaced with ML model)
    let riskScore = 0;

    // Check-in consistency (0-100, lower is worse)
    if (checkInConsistency < 30) riskScore += 0.3;
    else if (checkInConsistency < 60) riskScore += 0.15;

    // Skill completion rate (0-1, lower is worse)
    if (skillCompletionRate < 0.2) riskScore += 0.25;
    else if (skillCompletionRate < 0.5) riskScore += 0.1;

    // Days since last activity
    if (daysSinceLastActivity > 7) riskScore += 0.3;
    else if (daysSinceLastActivity > 3) riskScore += 0.15;

    // Emotional volatility (higher is worse)
    if (emotionalVolatility > 2.0) riskScore += 0.15;
    else if (emotionalVolatility > 1.0) riskScore += 0.05;

    return Math.min(riskScore, 1.0);
}

// ============================================================================
// MOCK IMPLEMENTATIONS (for development/testing)
// ============================================================================

async function analyzeSentimentMock(text, language) {
    // Simple keyword-based sentiment analysis
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'love', 'joy', 'خوش', 'اچھا'];
    const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'angry', 'depressed', 'اداس', 'برا'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
        if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    const score = total > 0 ? (positiveCount - negativeCount) / total : 0;
    const magnitude = total / words.length;

    const emotions = [];
    if (positiveCount > negativeCount) emotions.push('positive');
    if (negativeCount > positiveCount) emotions.push('negative');
    if (total === 0) emotions.push('neutral');

    return { score, magnitude, emotions };
}

async function simplifyLanguageFallback(text, targetLanguage) {
    // Simple term replacement
    const simplifications = {
        'depression': 'feeling very low',
        'anxiety': 'feeling very worried',
        'cognitive reframing': 'changing negative thoughts',
        'behavioral activation': 'doing small helpful tasks',
        'mindfulness': 'paying attention to the present moment',
        'resilience': 'ability to bounce back from difficulties',
        'coping mechanism': 'way to deal with stress',
        'therapeutic': 'helpful for healing',
        'intervention': 'helpful activity',
        'wellbeing': 'feeling good overall'
    };

    let simplified = text;
    for (const [complex, simple] of Object.entries(simplifications)) {
        const regex = new RegExp(complex, 'gi');
        simplified = simplified.replace(regex, simple);
    }

    return simplified;
}

// ============================================================================
// OPENAI IMPLEMENTATIONS
// ============================================================================

async function analyzeSentimentOpenAI(text, language) {
    if (!OPENAI_API_KEY) {
        console.warn('[AI Service] OpenAI API key not configured, falling back to mock');
        return analyzeSentimentMock(text, language);
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a sentiment analysis expert. Analyze the emotional tone of journal entries. Respond ONLY with valid JSON in this format: {"score": <number from -1 to 1>, "magnitude": <number from 0 to 1>, "emotions": [<array of emotion keywords>]}'
                    },
                    {
                        role: 'user',
                        content: `Analyze the sentiment of this ${language} text: "${text}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 150
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;
    } catch (error) {
        console.error('[AI Service] OpenAI sentiment analysis error:', error);
        return analyzeSentimentMock(text, language);
    }
}

async function simplifyLanguageOpenAI(text, targetLanguage, educationLevel) {
    if (!OPENAI_API_KEY) {
        console.warn('[AI Service] OpenAI API key not configured, falling back to simple replacement');
        return simplifyLanguageFallback(text, targetLanguage);
    }

    try {
        const languageName = targetLanguage === 'ur' ? 'Urdu' : 'English';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a language simplification expert. Simplify psychological and medical terms to Grade 5 reading level. Use simple, clear language appropriate for someone with ${educationLevel} education. Respond ONLY with the simplified text, no explanations.`
                    },
                    {
                        role: 'user',
                        content: `Simplify this text to ${languageName} at Grade 5 level: "${text}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 200
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('[AI Service] OpenAI language simplification error:', error);
        return simplifyLanguageFallback(text, targetLanguage);
    }
}

// ============================================================================
// GEMINI IMPLEMENTATIONS
// ============================================================================

async function analyzeSentimentGemini(text, language) {
    if (!GEMINI_API_KEY) {
        console.warn('[AI Service] Gemini API key not configured, falling back to mock');
        return analyzeSentimentMock(text, language);
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Analyze the sentiment of this ${language} journal entry and respond with ONLY valid JSON: {"score": <-1 to 1>, "magnitude": <0 to 1>, "emotions": [<emotion keywords>]}\n\nText: "${text}"`
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 150
                }
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.candidates[0].content.parts[0].text);
        return result;
    } catch (error) {
        console.error('[AI Service] Gemini sentiment analysis error:', error);
        return analyzeSentimentMock(text, language);
    }
}

async function simplifyLanguageGemini(text, targetLanguage, educationLevel) {
    if (!GEMINI_API_KEY) {
        console.warn('[AI Service] Gemini API key not configured, falling back to simple replacement');
        return simplifyLanguageFallback(text, targetLanguage);
    }

    try {
        const languageName = targetLanguage === 'ur' ? 'Urdu' : 'English';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Simplify this text to ${languageName} at Grade 5 reading level for someone with ${educationLevel} education. Use simple, clear words. Respond with ONLY the simplified text:\n\n"${text}"`
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 200
                }
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error('[AI Service] Gemini language simplification error:', error);
        return simplifyLanguageFallback(text, targetLanguage);
    }
}

// ============================================================================
// LOCAL MODEL IMPLEMENTATIONS (placeholder)
// ============================================================================

async function analyzeSentimentLocal(text, language) {
    // TODO: Implement local BERT/transformer model for sentiment analysis
    console.warn('[AI Service] Local sentiment analysis not yet implemented, using mock');
    return analyzeSentimentMock(text, language);
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

const db = require('../config/database');

async function checkSimplificationCache(originalText, targetLanguage, educationLevel) {
    try {
        const result = await db.query(
            `SELECT simplified_text, usage_count 
             FROM language_simplification_cache 
             WHERE original_text = $1 AND target_language = $2 AND education_level = $3`,
            [originalText, targetLanguage, educationLevel]
        );

        if (result.rows.length > 0) {
            // Increment usage count
            await db.query(
                `UPDATE language_simplification_cache 
                 SET usage_count = usage_count + 1 
                 WHERE original_text = $1 AND target_language = $2 AND education_level = $3`,
                [originalText, targetLanguage, educationLevel]
            );
            return result.rows[0].simplified_text;
        }
        return null;
    } catch (error) {
        console.error('[AI Service] Cache check error:', error);
        return null;
    }
}

async function cacheSimplification(originalText, simplifiedText, targetLanguage, educationLevel) {
    try {
        await db.query(
            `INSERT INTO language_simplification_cache 
             (original_text, simplified_text, target_language, education_level) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (original_text, target_language, education_level) 
             DO UPDATE SET simplified_text = $2, usage_count = language_simplification_cache.usage_count + 1`,
            [originalText, simplifiedText, targetLanguage, educationLevel]
        );
    } catch (error) {
        console.error('[AI Service] Cache save error:', error);
    }
}

module.exports = {
    analyzeSentiment,
    simplifyLanguage,
    predictDropoutRisk,
    generateAIResponse
};

/**
 * Generate a general AI response based on system and user prompts
 * @param {string} systemPrompt - Instructions for the AI
 * @param {string} userPrompt - Input data or query
 * @param {Object} config - Optional config (temperature, maxTokens)
 * @returns {Promise<string>} - AI response text
 */
async function generateAIResponse(systemPrompt, userPrompt, config = {}) {
    if (!userPrompt || userPrompt.trim().length === 0) {
        return '';
    }

    switch (AI_PROVIDER) {
        case 'openai':
            return await generateAIResponseOpenAI(systemPrompt, userPrompt, config);
        case 'gemini':
            return await generateAIResponseGemini(systemPrompt, userPrompt, config);
        default:
            return await generateAIResponseMock(systemPrompt, userPrompt);
    }
}

async function generateAIResponseOpenAI(systemPrompt, userPrompt, config) {
    if (!OPENAI_API_KEY) {
        console.warn('[AI Service] OpenAI API key not configured, falling back to mock');
        return generateAIResponseMock(systemPrompt, userPrompt);
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: config.temperature || 0.7,
                max_tokens: config.maxTokens || 300
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('[AI Service] OpenAI generation error:', error);
        return generateAIResponseMock(systemPrompt, userPrompt);
    }
}

async function generateAIResponseGemini(systemPrompt, userPrompt, config) {
    if (!GEMINI_API_KEY) {
        console.warn('[AI Service] Gemini API key not configured, falling back to mock');
        return generateAIResponseMock(systemPrompt, userPrompt);
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser Input: ${userPrompt}`
                    }]
                }],
                generationConfig: {
                    temperature: config.temperature || 0.7,
                    maxOutputTokens: config.maxTokens || 300
                }
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error('[AI Service] Gemini generation error:', error);
        return generateAIResponseMock(systemPrompt, userPrompt);
    }
}

async function generateAIResponseMock(systemPrompt, userPrompt) {
    // Basic mock response based on keywords
    const lowerPrompt = userPrompt.toLowerCase();

    if (lowerPrompt.includes('distress') || lowerPrompt.includes('struggling') || lowerPrompt.includes('crisis') || lowerPrompt.includes('red') || lowerPrompt.includes('orange')) {
        return JSON.stringify({
            insights: [
                "I hear how difficult things are for you right now.",
                "Your feelings are valid, and you don't have to go through this alone."
            ],
            encouragement: "Please be gentle with yourself today. You are doing the best you can."
        });
    } else if (lowerPrompt.includes('thriving') || lowerPrompt.includes('improving') || lowerPrompt.includes('good') || lowerPrompt.includes('green') || lowerPrompt.includes('yellow')) {
        return JSON.stringify({
            insights: [
                "It's wonderful to see you doing so well!",
                "Building on this positive momentum can help you stay strong."
            ],
            encouragement: "Keep up the amazing work! Your progress is inspiring."
        });
    }

    return JSON.stringify({
        insights: [
            "Thank you for sharing your check-in.",
            "Tracking your emotions is a great step towards wellbeing."
        ],
        encouragement: "We are here to support you on your journey."
    });
}
