// Centralized error codes for auth service
export enum AuthErrorCode {
  // Authentication errors (AUTH_1xx)
  INVALID_CREDENTIALS = 'AUTH_101',
  INVALID_TOKEN = 'AUTH_102',
  TOKEN_EXPIRED = 'AUTH_103',
  USER_NOT_FOUND = 'AUTH_104',
  
  // Registration errors (AUTH_2xx)
  USER_ALREADY_EXISTS = 'AUTH_201',
  INVALID_EMAIL = 'AUTH_202',
  WEAK_PASSWORD = 'AUTH_203',
  
  // Validation errors (AUTH_3xx)
  INVALID_INPUT = 'AUTH_301',
  MISSING_REQUIRED_FIELD = 'AUTH_302',
  
  // Internal errors (AUTH_5xx)
  DATABASE_ERROR = 'AUTH_501',
  INTERNAL_ERROR = 'AUTH_502',
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  correlationId?: string;
  details?: any;
  timestamp: string;
}

export class ErrorResponse {
  static create(
    code: AuthErrorCode,
    message: string,
    correlationId?: string,
    details?: any
  ): AuthError {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    return {
      code,
      message: isDevelopment ? message : this.getProductionMessage(code),
      correlationId,
      details: isDevelopment ? details : undefined, // Hide details in production
      timestamp: new Date().toISOString()
    };
  }

  private static getProductionMessage(code: AuthErrorCode): string {
    // Safe messages for production
    const productionMessages: Record<AuthErrorCode, string> = {
      [AuthErrorCode.INVALID_CREDENTIALS]: 'Authentication failed',
      [AuthErrorCode.INVALID_TOKEN]: 'Invalid or expired token',
      [AuthErrorCode.TOKEN_EXPIRED]: 'Session expired',
      [AuthErrorCode.USER_NOT_FOUND]: 'User not found',
      [AuthErrorCode.USER_ALREADY_EXISTS]: 'User already exists',
      [AuthErrorCode.INVALID_EMAIL]: 'Invalid email format',
      [AuthErrorCode.WEAK_PASSWORD]: 'Password does not meet requirements',
      [AuthErrorCode.INVALID_INPUT]: 'Invalid input provided',
      [AuthErrorCode.MISSING_REQUIRED_FIELD]: 'Required field missing',
      [AuthErrorCode.DATABASE_ERROR]: 'Service temporarily unavailable',
      [AuthErrorCode.INTERNAL_ERROR]: 'An error occurred',
    };

    return productionMessages[code] || 'An error occurred';
  }
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
