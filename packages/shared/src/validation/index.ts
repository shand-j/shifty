/**
 * Centralized Validation Schemas for Shifty Platform
 * 
 * This module provides Zod validation schemas for all API requests,
 * JWT payloads, and other inputs to ensure security and data integrity.
 */

import { z } from 'zod';

// ============================================================
// JWT PAYLOAD VALIDATION
// ============================================================

/**
 * Schema for validating JWT payload structure.
 * Ensures all required fields are present and properly formatted.
 */
export const JwtPayloadSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  tenantId: z.string().uuid('Invalid tenant ID format'),
  role: z.enum(['owner', 'admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Invalid role. Must be one of: owner, admin, member, viewer' })
  }),
  email: z.string().email('Invalid email format'),
  iat: z.number().optional(),
  exp: z.number().optional(),
  iss: z.string().optional()
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

/**
 * Validates and sanitizes JWT payload data.
 * Returns validated payload or throws ZodError.
 */
export function validateJwtPayload(payload: unknown): JwtPayload {
  return JwtPayloadSchema.parse(payload);
}

/**
 * Safely validates JWT payload without throwing.
 * Returns success/error result.
 */
export function safeValidateJwtPayload(payload: unknown): z.SafeParseReturnType<unknown, JwtPayload> {
  return JwtPayloadSchema.safeParse(payload);
}

// ============================================================
// REQUEST BODY SIZE VALIDATION
// ============================================================

/**
 * Configuration for request body limits.
 * These values should be used in Fastify configuration.
 */
export const RequestLimits = {
  /** Maximum body size for JSON requests (1MB) */
  bodyLimit: 1048576,
  /** Request timeout in milliseconds (30 seconds) */
  requestTimeout: 30000,
  /** Maximum URL length (2048 characters) */
  maxUrlLength: 2048,
  /** Maximum selector length (1000 characters) */
  maxSelectorLength: 1000,
  /** Maximum requirements text length (10000 characters) */
  maxRequirementsLength: 10000
} as const;

// ============================================================
// HEALING REQUEST VALIDATION
// ============================================================

/**
 * List of allowed domains for URL validation.
 * In production, this should be configured via environment variables.
 */
export const getAllowedDomains = (): string[] => {
  const envDomains = process.env.ALLOWED_HEAL_DOMAINS;
  if (envDomains) {
    return envDomains.split(',').map(d => d.trim().toLowerCase());
  }
  // Default allowed domains for development
  return [
    'localhost',
    '127.0.0.1',
    'example.com',
    '*.example.com'
  ];
};

/**
 * Validates URL against allowed domains list.
 */
export function isUrlAllowed(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const allowedDomains = getAllowedDomains();
    
    // In development/test mode, allow all URLs
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    
    return allowedDomains.some(domain => {
      if (domain.startsWith('*.')) {
        // Wildcard domain match
        const baseDomain = domain.slice(2);
        return hostname === baseDomain || hostname.endsWith('.' + baseDomain);
      }
      return hostname === domain;
    });
  } catch {
    return false;
  }
}

/**
 * Sanitizes CSS selector strings to prevent injection attacks.
 * Removes potentially dangerous characters and patterns.
 */
export function sanitizeSelector(selector: string): string {
  if (!selector || typeof selector !== 'string') {
    return '';
  }
  
  // Limit length
  let sanitized = selector.slice(0, RequestLimits.maxSelectorLength);
  
  // Remove potentially dangerous patterns
  // Remove JavaScript protocol URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  // Remove data: URLs
  sanitized = sanitized.replace(/data:/gi, '');
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized.trim();
}

/**
 * Schema for heal-selector request validation.
 */
export const HealSelectorRequestSchema = z.object({
  url: z.string()
    .url('Invalid URL format')
    .max(RequestLimits.maxUrlLength, `URL must not exceed ${RequestLimits.maxUrlLength} characters`)
    .refine(isUrlAllowed, {
      message: 'URL domain is not in the allowed list'
    }),
  brokenSelector: z.string()
    .min(1, 'Selector cannot be empty')
    .max(RequestLimits.maxSelectorLength, `Selector must not exceed ${RequestLimits.maxSelectorLength} characters`)
    .transform(sanitizeSelector),
  strategy: z.enum([
    'data-testid-recovery',
    'text-content-matching', 
    'css-hierarchy-analysis',
    'ai-powered-analysis'
  ]).optional(),
  expectedElementType: z.string()
    .max(100, 'Element type must not exceed 100 characters')
    .optional(),
  context: z.object({
    previouslyWorking: z.boolean().default(false),
    browserType: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
    viewport: z.object({
      width: z.number().int().min(320).max(3840).default(1920),
      height: z.number().int().min(240).max(2160).default(1080)
    }).optional(),
    userAgent: z.string().max(500).optional()
  }).optional()
});

export type HealSelectorRequest = z.infer<typeof HealSelectorRequestSchema>;

/**
 * Schema for batch-heal request validation.
 */
export const BatchHealRequestSchema = z.object({
  url: z.string()
    .url('Invalid URL format')
    .max(RequestLimits.maxUrlLength, `URL must not exceed ${RequestLimits.maxUrlLength} characters`)
    .refine(isUrlAllowed, {
      message: 'URL domain is not in the allowed list'
    }),
  selectors: z.array(z.object({
    id: z.string().uuid('Invalid selector ID format'),
    selector: z.string()
      .min(1, 'Selector cannot be empty')
      .max(RequestLimits.maxSelectorLength)
      .transform(sanitizeSelector),
    expectedElementType: z.string().max(100).optional()
  })).min(1, 'At least one selector is required')
    .max(50, 'Cannot process more than 50 selectors at once'),
  browserType: z.enum(['chromium', 'firefox', 'webkit']).default('chromium')
});

export type BatchHealRequest = z.infer<typeof BatchHealRequestSchema>;

// ============================================================
// TEST GENERATION REQUEST VALIDATION
// ============================================================

/**
 * Schema for test generation request validation.
 */
export const GenerateTestRequestSchema = z.object({
  url: z.string()
    .url('Invalid URL format')
    .max(RequestLimits.maxUrlLength, `URL must not exceed ${RequestLimits.maxUrlLength} characters`),
  requirements: z.string()
    .min(10, 'Requirements must be at least 10 characters')
    .max(RequestLimits.maxRequirementsLength, `Requirements must not exceed ${RequestLimits.maxRequirementsLength} characters`),
  testType: z.enum(['e2e', 'integration', 'smoke', 'regression']).default('e2e'),
  browserType: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
  options: z.object({
    generateVisualTests: z.boolean().default(false),
    includeAccessibility: z.boolean().default(false),
    mobileViewport: z.boolean().default(false),
    timeout: z.number().int().min(5000).max(60000).default(30000)
  }).optional()
});

export type GenerateTestRequest = z.infer<typeof GenerateTestRequestSchema>;

// ============================================================
// TENANT ID VALIDATION
// ============================================================

/**
 * Schema for tenant ID validation from headers.
 */
export const TenantIdSchema = z.string()
  .uuid('Invalid tenant ID format')
  .describe('Tenant ID must be a valid UUID');

/**
 * Validates tenant ID from request headers.
 */
export function validateTenantId(tenantId: unknown): string {
  return TenantIdSchema.parse(tenantId);
}

// ============================================================
// COMMON VALIDATION HELPERS
// ============================================================

/**
 * Creates a standardized validation error response.
 */
export function createValidationErrorResponse(error: z.ZodError) {
  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  };
}

/**
 * Type guard to check if a value is a valid UUID.
 */
export function isValidUuid(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
