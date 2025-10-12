"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = exports.ValidationUtils = exports.ErrorUtils = exports.SecurityUtils = exports.AiUtils = exports.DatabaseUtils = exports.TenantUtils = void 0;
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
// Utility functions for tenant operations
class TenantUtils {
    static generateTenantId() {
        return (0, uuid_1.v4)();
    }
    static createTenantSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[-\s]+/g, '-')
            .substring(0, 50);
    }
    static getTenantDatabaseUrl(tenantId, region) {
        const host = `shifty-tenant-${tenantId}-db.${region}.rds.amazonaws.com`;
        return `postgresql://shifty:${process.env.DB_PASSWORD}@${host}:5432/shifty`;
    }
    static getTenantS3Bucket(tenantId, region) {
        return `shifty-tenant-${tenantId}-${region}`;
    }
}
exports.TenantUtils = TenantUtils;
// Database utilities
class DatabaseUtils {
    static isValidConnection(url) {
        try {
            new URL(url);
            return url.startsWith('postgresql://');
        }
        catch {
            return false;
        }
    }
    static extractTenantIdFromUrl(url) {
        const match = url.match(/shifty-tenant-([a-f0-9-]+)-db/);
        return match ? match[1] : null;
    }
    static createTenantSchema(tenantId) {
        return `tenant_${tenantId.replace(/-/g, '_')}`;
    }
}
exports.DatabaseUtils = DatabaseUtils;
// AI utilities
class AiUtils {
    static calculateConfidenceScore(results) {
        if (!results.length)
            return 0;
        const avgScore = results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;
        return Math.round(avgScore * 100) / 100;
    }
    static sanitizeAiPrompt(prompt) {
        return prompt
            .replace(/[<>]/g, '')
            .trim()
            .substring(0, 4000);
    }
    static extractCodeFromResponse(response) {
        const codeBlockRegex = /```(?:typescript|javascript|ts|js)?\n?([\s\S]*?)```/g;
        const matches = [...response.matchAll(codeBlockRegex)];
        return matches.length > 0 ? matches[0][1].trim() : response.trim();
    }
}
exports.AiUtils = AiUtils;
// Security utilities  
class SecurityUtils {
    static hashTenantData(data, tenantId) {
        const crypto = require('crypto');
        return crypto.createHmac('sha256', `${tenantId}-salt`).update(data).digest('hex');
    }
    static validateTenantAccess(userId, tenantId, userTenantId) {
        return userTenantId === tenantId;
    }
    static sanitizeInput(input) {
        return input.replace(/[<>&"']/g, (match) => {
            const map = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return map[match];
        });
    }
}
exports.SecurityUtils = SecurityUtils;
// Error handling utilities
class ErrorUtils {
    static createApiError(message, code, statusCode = 500) {
        return {
            success: false,
            error: {
                message,
                code,
                statusCode,
                timestamp: new Date().toISOString()
            }
        };
    }
    static isTenantError(error) {
        return error?.code?.includes('TENANT_') || false;
    }
    static logError(error, context = {}) {
        console.error({
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }
}
exports.ErrorUtils = ErrorUtils;
// Validation utilities
class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.ValidationUtils = ValidationUtils;
// Date utilities
class DateUtils {
    static formatDate(date) {
        const d = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
        return (0, date_fns_1.isValid)(d) ? (0, date_fns_1.format)(d, 'yyyy-MM-dd HH:mm:ss') : '';
    }
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    static isExpired(date) {
        return date < new Date();
    }
}
exports.DateUtils = DateUtils;
//# sourceMappingURL=index.js.map