import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isValid } from 'date-fns';

// Utility functions for tenant operations
export class TenantUtils {
  static generateTenantId(): string {
    return uuidv4();
  }

  static createTenantSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-')
      .substring(0, 50);
  }

  static getTenantDatabaseUrl(tenantId: string, region: string): string {
    const host = `shifty-tenant-${tenantId}-db.${region}.rds.amazonaws.com`;
    return `postgresql://shifty:${process.env.DB_PASSWORD}@${host}:5432/shifty`;
  }

  static getTenantS3Bucket(tenantId: string, region: string): string {
    return `shifty-tenant-${tenantId}-${region}`;
  }
}

// Database utilities
export class DatabaseUtils {
  static isValidConnection(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('postgresql://');
    } catch {
      return false;
    }
  }

  static extractTenantIdFromUrl(url: string): string | null {
    const match = url.match(/shifty-tenant-([a-f0-9-]+)-db/);
    return match ? match[1] : null;
  }

  static createTenantSchema(tenantId: string): string {
    return `tenant_${tenantId.replace(/-/g, '_')}`;
  }
}

// AI utilities
export class AiUtils {
  static calculateConfidenceScore(results: any[]): number {
    if (!results.length) return 0;
    const avgScore = results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;
    return Math.round(avgScore * 100) / 100;
  }

  static sanitizeAiPrompt(prompt: string): string {
    return prompt
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 4000);
  }

  static extractCodeFromResponse(response: string): string {
    const codeBlockRegex = /```(?:typescript|javascript|ts|js)?\n?([\s\S]*?)```/g;
    const matches = [...response.matchAll(codeBlockRegex)];
    return matches.length > 0 ? matches[0][1].trim() : response.trim();
  }
}

// Security utilities  
export class SecurityUtils {
  static hashTenantData(data: string, tenantId: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', `${tenantId}-salt`).update(data).digest('hex');
  }

  static validateTenantAccess(userId: string, tenantId: string, userTenantId: string): boolean {
    return userTenantId === tenantId;
  }

  static sanitizeInput(input: string): string {
    return input.replace(/[<>&"']/g, (match) => {
      const map: Record<string, string> = {
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

// Error handling utilities
export class ErrorUtils {
  static createApiError(message: string, code: string, statusCode: number = 500) {
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

  static isTenantError(error: any): boolean {
    return error?.code?.includes('TENANT_') || false;
  }

  static logError(error: Error, context: Record<string, any> = {}) {
    console.error({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }
}

// Validation utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Date utilities
export class DateUtils {
  static formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, 'yyyy-MM-dd HH:mm:ss') : '';
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isExpired(date: Date): boolean {
    return date < new Date();
  }
}