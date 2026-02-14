/**
 * Research-Based Assessment Instruments
 * Implements PHQ-2, GAD-2, and WHO-5 scoring algorithms
 */

/**
 * PHQ-2 (Patient Health Questionnaire-2)
 * Brief depression screening tool
 * 
 * Questions (over the past 2 weeks):
 * 1. Little interest or pleasure in doing things
 * 2. Feeling down, depressed, or hopeless
 * 
 * Scale: 0 (Not at all) to 3 (Nearly every day)
 * Score Range: 0-6
 * Threshold: ≥3 suggests depression risk
 */

const PHQ2_QUESTIONS = [
    {
        id: 'phq2_q1',
        text: 'Over the past 2 weeks, how often have you had little interest or pleasure in doing things?',
        urdu: 'پچھلے 2 ہفتوں میں، آپ کو کتنی بار چیزیں کرنے میں دلچسپی یا خوشی کم محسوس ہوئی؟',
        simplified: 'In the past 2 weeks, how often did you feel less interested in things you usually enjoy?'
    },
    {
        id: 'phq2_q2',
        text: 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?',
        urdu: 'پچھلے 2 ہفتوں میں، آپ کو کتنی بار اداس، مایوس یا ناامید محسوس ہوا؟',
        simplified: 'In the past 2 weeks, how often did you feel very sad or without hope?'
    }
];

const PHQ2_SCALE = [
    { value: 0, label: 'Not at all', urdu: 'بالکل نہیں', simplified: 'Not at all' },
    { value: 1, label: 'Several days', urdu: 'کئی دن', simplified: 'A few days' },
    { value: 2, label: 'More than half the days', urdu: 'آدھے سے زیادہ دن', simplified: 'More than half the days' },
    { value: 3, label: 'Nearly every day', urdu: 'تقریباً ہر دن', simplified: 'Almost every day' }
];

/**
 * GAD-2 (Generalized Anxiety Disorder-2)
 * Brief anxiety screening tool
 * 
 * Questions (over the past 2 weeks):
 * 1. Feeling nervous, anxious, or on edge
 * 2. Not being able to stop or control worrying
 * 
 * Scale: 0 (Not at all) to 3 (Nearly every day)
 * Score Range: 0-6
 * Threshold: ≥3 suggests anxiety risk
 */

const GAD2_QUESTIONS = [
    {
        id: 'gad2_q1',
        text: 'Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?',
        urdu: 'پچھلے 2 ہفتوں میں، آپ کو کتنی بار گھبراہٹ، بے چینی یا پریشانی محسوس ہوئی؟',
        simplified: 'In the past 2 weeks, how often did you feel very worried or nervous?'
    },
    {
        id: 'gad2_q2',
        text: 'Over the past 2 weeks, how often have you not been able to stop or control worrying?',
        urdu: 'پچھلے 2 ہفتوں میں، آپ کتنی بار اپنی فکروں کو روک یا قابو نہیں کر سکے؟',
        simplified: 'In the past 2 weeks, how often could you not stop worrying?'
    }
];

const GAD2_SCALE = PHQ2_SCALE; // Same scale as PHQ-2

/**
 * WHO-5 Wellbeing Index (Simplified 3-item version)
 * Measures subjective psychological wellbeing
 * 
 * Questions (over the past 2 weeks):
 * 1. I have felt cheerful and in good spirits
 * 2. I have felt active and vigorous
 * 3. I have felt calm and relaxed
 * 
 * Scale: 0 (At no time) to 5 (All of the time)
 * Raw Score Range: 0-15
 * Normalized Score: 0-100 (raw * 100 / 15)
 */

const WHO5_QUESTIONS = [
    {
        id: 'who5_q1',
        text: 'Over the past 2 weeks, I have felt cheerful and in good spirits',
        urdu: 'پچھلے 2 ہفتوں میں، میں خوش اور اچھے موڈ میں رہا/رہی',
        simplified: 'In the past 2 weeks, I felt happy and cheerful'
    },
    {
        id: 'who5_q2',
        text: 'Over the past 2 weeks, I have felt active and energetic',
        urdu: 'پچھلے 2 ہفتوں میں، میں متحرک اور توانا محسوس کیا',
        simplified: 'In the past 2 weeks, I felt active and full of energy'
    },
    {
        id: 'who5_q3',
        text: 'Over the past 2 weeks, I have felt calm and relaxed',
        urdu: 'پچھلے 2 ہفتوں میں، میں پرسکون اور آرام دہ محسوس کیا',
        simplified: 'In the past 2 weeks, I felt calm and peaceful'
    }
];

const WHO5_SCALE = [
    { value: 0, label: 'At no time', urdu: 'کبھی نہیں', simplified: 'Never' },
    { value: 1, label: 'Some of the time', urdu: 'کبھی کبھی', simplified: 'Sometimes' },
    { value: 2, label: 'Less than half the time', urdu: 'آدھے سے کم وقت', simplified: 'Less than half the time' },
    { value: 3, label: 'More than half the time', urdu: 'آدھے سے زیادہ وقت', simplified: 'More than half the time' },
    { value: 4, label: 'Most of the time', urdu: 'زیادہ تر وقت', simplified: 'Most of the time' },
    { value: 5, label: 'All of the time', urdu: 'ہر وقت', simplified: 'All the time' }
];

/**
 * Calculate PHQ-2 score
 * @param {Object} responses - { phq2_q1: number, phq2_q2: number }
 * @returns {Object} - { q1: number, q2: number, total: number, riskFlag: boolean }
 */
function calculatePHQ2Score(responses) {
    const q1 = parseInt(responses.phq2_q1) || 0;
    const q2 = parseInt(responses.phq2_q2) || 0;
    const total = q1 + q2;
    const riskFlag = total >= 3;

    return {
        q1,
        q2,
        total,
        riskFlag,
        interpretation: riskFlag
            ? 'Depression screening positive - further assessment recommended'
            : 'Depression screening negative'
    };
}

/**
 * Calculate GAD-2 score
 * @param {Object} responses - { gad2_q1: number, gad2_q2: number }
 * @returns {Object} - { q1: number, q2: number, total: number, riskFlag: boolean }
 */
function calculateGAD2Score(responses) {
    const q1 = parseInt(responses.gad2_q1) || 0;
    const q2 = parseInt(responses.gad2_q2) || 0;
    const total = q1 + q2;
    const riskFlag = total >= 3;

    return {
        q1,
        q2,
        total,
        riskFlag,
        interpretation: riskFlag
            ? 'Anxiety screening positive - further assessment recommended'
            : 'Anxiety screening negative'
    };
}

/**
 * Calculate WHO-5 wellbeing score
 * @param {Object} responses - { who5_q1: number, who5_q2: number, who5_q3: number }
 * @returns {Object} - { q1: number, q2: number, q3: number, raw: number, normalized: number }
 */
function calculateWHO5Score(responses) {
    const q1 = parseInt(responses.who5_q1) || 0;
    const q2 = parseInt(responses.who5_q2) || 0;
    const q3 = parseInt(responses.who5_q3) || 0;
    const raw = q1 + q2 + q3;
    const normalized = Math.round((raw * 100) / 15);

    return {
        q1,
        q2,
        q3,
        raw,
        normalized,
        interpretation: normalized < 50
            ? 'Low wellbeing - support recommended'
            : normalized < 70
                ? 'Moderate wellbeing'
                : 'Good wellbeing'
    };
}

/**
 * Assess overall risk thresholds
 * @param {Object} phq2 - PHQ-2 score object
 * @param {Object} gad2 - GAD-2 score object
 * @param {Object} who5 - WHO-5 score object
 * @returns {Object} - Risk assessment
 */
function assessRiskThresholds(phq2, gad2, who5) {
    const depressionRisk = phq2.riskFlag;
    const anxietyRisk = gad2.riskFlag;
    const lowWellbeing = who5.normalized < 50;

    // Calculate composite risk probability (0-1)
    let riskProbability = 0;
    if (depressionRisk) riskProbability += 0.4;
    if (anxietyRisk) riskProbability += 0.4;
    if (lowWellbeing) riskProbability += 0.2;

    return {
        depressionRisk,
        anxietyRisk,
        lowWellbeing,
        riskProbability: Math.min(riskProbability, 1.0),
        anyRisk: depressionRisk || anxietyRisk || lowWellbeing
    };
}

/**
 * Generate emotional tier based on research scores
 * @param {Object} phq2 - PHQ-2 score
 * @param {Object} gad2 - GAD-2 score
 * @param {Object} who5 - WHO-5 score
 * @returns {string} - 'green', 'yellow', 'orange', or 'red'
 */
function generateEmotionalTier(phq2, gad2, who5) {
    const risk = assessRiskThresholds(phq2, gad2, who5);

    // Red: High risk (both depression and anxiety, or very low wellbeing)
    if ((phq2.total >= 5 && gad2.total >= 5) || who5.normalized < 30) {
        return 'red';
    }

    // Orange: Moderate-high risk (one positive screen + low wellbeing)
    if ((phq2.riskFlag || gad2.riskFlag) && who5.normalized < 50) {
        return 'orange';
    }

    // Yellow: Mild risk (one positive screen OR moderate wellbeing)
    if (phq2.riskFlag || gad2.riskFlag || who5.normalized < 70) {
        return 'yellow';
    }

    // Green: Low risk
    return 'green';
}

/**
 * Generate simplified explanation (no medical language)
 * @param {string} tier - Emotional tier
 * @param {Object} phq2 - PHQ-2 score
 * @param {Object} gad2 - GAD-2 score
 * @param {Object} who5 - WHO-5 score
 * @param {string} language - 'en' or 'ur'
 * @returns {string} - Simplified explanation
 */
function generateSimplifiedExplanation(tier, phq2, gad2, who5, language = 'en') {
    const explanations = {
        en: {
            red: `You're going through a very difficult time right now. It's okay to feel this way, and you don't have to face it alone. Let's take small steps together to help you feel better.`,
            orange: `Things have been challenging lately. You might be feeling very low or very worried. Let's work on some simple activities that can help you feel a bit better each day.`,
            yellow: `You're doing okay, but there's room to feel even better. Let's focus on small positive steps to boost your mood and energy.`,
            green: `You're doing well! This is a great time to learn new things and work on your goals. Keep up the good work!`
        },
        ur: {
            red: `آپ اس وقت بہت مشکل وقت سے گزر رہے ہیں۔ ایسا محسوس کرنا ٹھیک ہے، اور آپ کو اکیلے اس کا سامنا نہیں کرنا ہے۔ آئیں چھوٹے قدم اٹھائیں تاکہ آپ بہتر محسوس کریں۔`,
            orange: `حالیہ دنوں میں چیزیں مشکل رہی ہیں۔ آپ بہت اداس یا بہت پریشان محسوس کر رہے ہوں گے۔ آئیں کچھ آسان سرگرمیوں پر کام کریں جو آپ کو ہر دن تھوڑا بہتر محسوس کرنے میں مدد کر سکتی ہیں۔`,
            yellow: `آپ ٹھیک ہیں، لیکن اور بھی بہتر محسوس کرنے کی گنجائش ہے۔ آئیں چھوٹے مثبت قدموں پر توجہ دیں تاکہ آپ کا موڈ اور توانائی بہتر ہو۔`,
            green: `آپ اچھا کر رہے ہیں! یہ نئی چیزیں سیکھنے اور اپنے مقاصد پر کام کرنے کا بہترین وقت ہے۔ اچھا کام جاری رکھیں!`
        }
    };

    return explanations[language]?.[tier] || explanations.en[tier];
}

/**
 * Get all instrument questions for frontend
 * @param {string} language - 'en', 'ur', or 'simplified'
 * @returns {Object} - All questions organized by instrument
 */
function getInstrumentQuestions(language = 'en') {
    const textKey = language === 'ur' ? 'urdu' : language === 'simplified' ? 'simplified' : 'text';

    return {
        phq2: {
            name: 'PHQ-2 Depression Screening',
            questions: PHQ2_QUESTIONS.map(q => ({ id: q.id, text: q[textKey] })),
            scale: PHQ2_SCALE.map(s => ({ value: s.value, label: s[language] || s.label }))
        },
        gad2: {
            name: 'GAD-2 Anxiety Screening',
            questions: GAD2_QUESTIONS.map(q => ({ id: q.id, text: q[textKey] })),
            scale: GAD2_SCALE.map(s => ({ value: s.value, label: s[language] || s.label }))
        },
        who5: {
            name: 'WHO-5 Wellbeing Index',
            questions: WHO5_QUESTIONS.map(q => ({ id: q.id, text: q[textKey] })),
            scale: WHO5_SCALE.map(s => ({ value: s.value, label: s[language] || s.label }))
        }
    };
}

module.exports = {
    // Scoring functions
    calculatePHQ2Score,
    calculateGAD2Score,
    calculateWHO5Score,
    assessRiskThresholds,
    generateEmotionalTier,
    generateSimplifiedExplanation,

    // Question data
    getInstrumentQuestions,
    PHQ2_QUESTIONS,
    GAD2_QUESTIONS,
    WHO5_QUESTIONS,
    PHQ2_SCALE,
    GAD2_SCALE,
    WHO5_SCALE
};
