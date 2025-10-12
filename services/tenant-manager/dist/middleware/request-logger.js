"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const uuid_1 = require("uuid");
function requestLogger(req, res, next) {
    // Generate request ID if not present
    if (!req.headers['x-request-id']) {
        req.headers['x-request-id'] = (0, uuid_1.v4)();
    }
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'];
    // Log incoming request
    console.log(`📥 [${requestId}] ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined
    });
    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        console.log(`📤 [${requestId}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`, {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            contentLength: res.getHeader('content-length'),
            timestamp: new Date().toISOString()
        });
    });
    next();
}
function sanitizeBody(body) {
    if (!body)
        return body;
    const sanitized = { ...body };
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
//# sourceMappingURL=request-logger.js.map