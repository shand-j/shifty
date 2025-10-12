export declare class TenantUtils {
    static generateTenantId(): string;
    static createTenantSlug(name: string): string;
    static getTenantDatabaseUrl(tenantId: string, region: string): string;
    static getTenantS3Bucket(tenantId: string, region: string): string;
}
export declare class DatabaseUtils {
    static isValidConnection(url: string): boolean;
    static extractTenantIdFromUrl(url: string): string | null;
    static createTenantSchema(tenantId: string): string;
}
export declare class AiUtils {
    static calculateConfidenceScore(results: any[]): number;
    static sanitizeAiPrompt(prompt: string): string;
    static extractCodeFromResponse(response: string): string;
}
export declare class SecurityUtils {
    static hashTenantData(data: string, tenantId: string): string;
    static validateTenantAccess(userId: string, tenantId: string, userTenantId: string): boolean;
    static sanitizeInput(input: string): string;
}
export declare class ErrorUtils {
    static createApiError(message: string, code: string, statusCode?: number): {
        success: boolean;
        error: {
            message: string;
            code: string;
            statusCode: number;
            timestamp: string;
        };
    };
    static isTenantError(error: any): boolean;
    static logError(error: Error, context?: Record<string, any>): void;
}
export declare class ValidationUtils {
    static isValidEmail(email: string): boolean;
    static isValidUUID(uuid: string): boolean;
    static isValidUrl(url: string): boolean;
}
export declare class DateUtils {
    static formatDate(date: Date | string): string;
    static addDays(date: Date, days: number): Date;
    static isExpired(date: Date): boolean;
}
//# sourceMappingURL=index.d.ts.map