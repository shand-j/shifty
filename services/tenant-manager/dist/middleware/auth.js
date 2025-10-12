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
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token is required'
        });
    }
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