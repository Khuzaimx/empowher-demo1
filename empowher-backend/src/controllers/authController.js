const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const jwtConfig = require('../config/jwt');

/**
 * Register a new user
 */
const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const result = await db.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
            [email, passwordHash, 'user']
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // Set cookie
        res.cookie('token', token, jwtConfig.cookieOptions);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
};

/**
 * Login user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await db.query(
            'SELECT id, email, password_hash, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // Set cookie
        res.cookie('token', token, jwtConfig.cookieOptions);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

/**
 * Logout user
 */
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, email, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Create anonymous session
 */
const createAnonymousSession = async (req, res) => {
    try {
        // Create anonymous user
        const anonymousEmail = `anonymous_${Date.now()}@empowher.local`;
        const randomPassword = Math.random().toString(36).slice(-12);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(randomPassword, salt);

        const result = await db.query(
            'INSERT INTO users (email, password_hash, role, is_anonymous) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
            [anonymousEmail, passwordHash, 'user', true]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, anonymous: true },
            jwtConfig.secret,
            { expiresIn: '24h' } // Shorter expiry for anonymous users
        );

        // Set cookie
        res.cookie('token', token, { ...jwtConfig.cookieOptions, maxAge: 24 * 60 * 60 * 1000 });

        res.status(201).json({
            message: 'Anonymous session created',
            user: {
                id: user.id,
                anonymous: true
            }
        });
    } catch (error) {
        console.error('Anonymous session error:', error);
        res.status(500).json({ error: 'Server error creating anonymous session' });
    }
};

module.exports = {
    signup,
    login,
    logout,
    getCurrentUser,
    createAnonymousSession
};
