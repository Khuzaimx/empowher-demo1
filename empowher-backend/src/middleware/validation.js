const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * Validation rules for user signup
 */
const signupValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate
];

/**
 * Validation rules for login
 */
const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate
];

/**
 * Validation rules for emotional check-in
 * Supports both legacy format (mood_score, energy_level, stress_level)
 * and new research-grounded format (PHQ-2, GAD-2, WHO-5)
 * All fields are optional - at least one set should be provided
 */
const checkinValidation = [
    // Legacy format (optional for backward compatibility)
    body('mood_score')
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: 10 })
        .withMessage('Mood score must be between 1 and 10'),
    body('energy_level')
        .optional({ checkFalsy: true })
        .isIn(['low', 'medium', 'high'])
        .withMessage('Energy level must be low, medium, or high'),
    body('stress_level')
        .optional({ checkFalsy: true })
        .isIn(['low', 'medium', 'high'])
        .withMessage('Stress level must be low, medium, or high'),

    // Research instruments (PHQ-2, GAD-2, WHO-5) - all optional
    body('phq2_q1')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 3 })
        .withMessage('PHQ-2 Q1 must be between 0 and 3'),
    body('phq2_q2')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 3 })
        .withMessage('PHQ-2 Q2 must be between 0 and 3'),
    body('gad2_q1')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 3 })
        .withMessage('GAD-2 Q1 must be between 0 and 3'),
    body('gad2_q2')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 3 })
        .withMessage('GAD-2 Q2 must be between 0 and 3'),
    body('who5_q1')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 5 })
        .withMessage('WHO-5 Q1 must be between 0 and 5'),
    body('who5_q2')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 5 })
        .withMessage('WHO-5 Q2 must be between 0 and 5'),
    body('who5_q3')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 5 })
        .withMessage('WHO-5 Q3 must be between 0 and 5'),

    // Common fields
    body('journal')
        .optional({ checkFalsy: true })
        .isString()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Journal entry must be less than 5000 characters'),
    body('interests')
        .optional({ checkFalsy: true })
        .isArray()
        .withMessage('Interests must be an array'),
    body('interests.*')
        .optional({ checkFalsy: true })
        .isString()
        .trim(),
    validate
];

/**
 * Validation rules for skill progress update
 */
const skillProgressValidation = [
    param('id').isUUID().withMessage('Invalid skill ID'),
    body('progress_percentage')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),
    validate
];

module.exports = {
    validate,
    signupValidation,
    loginValidation,
    checkinValidation,
    skillProgressValidation
};
