"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }
    // CRITICAL: Hardcoded JWT secret - SECURITY VULNERABILITY
    // FIXME: Same secret must be used across all services
    // TODO: Centralize secret management, load from shared config
    // Effort: 30 minutes | Priority: CRITICAL
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            id: decoded.id || decoded.userId,
            email: decoded.email,
            tenantId: decoded.tenantId,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
}
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next(); // Continue without authentication
    }
    // CRITICAL: Hardcoded JWT secret - centralize with authenticateToken
    // Effort: 30 minutes | Priority: CRITICAL
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            id: decoded.id || decoded.userId,
            email: decoded.email,
            tenantId: decoded.tenantId,
            role: decoded.role
        };
    }
    catch (error) {
        // Token invalid but continue - user will be undefined
    }
    next();
}
//# sourceMappingURL=auth.js.map