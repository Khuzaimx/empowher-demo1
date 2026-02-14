const helmet = require('helmet');
const xss = require('xss-clean');

/**
 * Security middleware configuration
 */
const securityMiddleware = (app) => {
    // Set security HTTP headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    }));

    // Prevent XSS attacks
    app.use(xss());
};

module.exports = securityMiddleware;

