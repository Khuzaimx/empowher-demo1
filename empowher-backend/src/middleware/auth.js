const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Middleware to verify JWT token from cookies
 */
const authenticateToken = async (req, res, next) => {
    try {
        // DEBUG LOGGING
        console.log('[AuthMiddleware] Headers:', req.headers);
        console.log('[AuthMiddleware] Cookies:', req.cookies);

        let token = req.cookies ? req.cookies.token : undefined;

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7, authHeader.length);
            }
        }

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, jwtConfig.secret);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('[AuthMiddleware] verify error:', error.message);
        return res.status(403).json({ error: 'Invalid or expired token', details: error.message });
    }
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (token) {
            const decoded = jwt.verify(token, jwtConfig.secret);
            req.user = decoded;
        }
    } catch (error) {
        // Silently fail for optional auth
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth
};
