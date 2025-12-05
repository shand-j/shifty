/**
 * Unit tests for validation schemas
 */

import {
  JwtPayloadSchema,
  validateJwtPayload,
  safeValidateJwtPayload,
  HealSelectorRequestSchema,
  BatchHealRequestSchema,
  GenerateTestRequestSchema,
  TenantIdSchema,
  validateTenantId,
  sanitizeSelector,
  isUrlAllowed,
  RequestLimits,
  createValidationErrorResponse,
  isValidUuid
} from '@shifty/shared';

describe('JwtPayloadSchema', () => {
  const validPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    role: 'admin' as const,
    email: 'test@example.com'
  };

  it('should validate a correct JWT payload', () => {
    const result = JwtPayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userId).toBe(validPayload.userId);
      expect(result.data.tenantId).toBe(validPayload.tenantId);
      expect(result.data.role).toBe(validPayload.role);
      expect(result.data.email).toBe(validPayload.email);
    }
  });

  it('should reject invalid UUID for userId', () => {
    const result = JwtPayloadSchema.safeParse({
      ...validPayload,
      userId: 'not-a-uuid'
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID for tenantId', () => {
    const result = JwtPayloadSchema.safeParse({
      ...validPayload,
      tenantId: 'not-a-uuid'
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = JwtPayloadSchema.safeParse({
      ...validPayload,
      email: 'not-an-email'
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid role', () => {
    const result = JwtPayloadSchema.safeParse({
      ...validPayload,
      role: 'superadmin'
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid roles', () => {
    const roles = ['owner', 'admin', 'member', 'viewer'] as const;
    for (const role of roles) {
      const result = JwtPayloadSchema.safeParse({
        ...validPayload,
        role
      });
      expect(result.success).toBe(true);
    }
  });

  it('should allow optional iat, exp, iss fields', () => {
    const result = JwtPayloadSchema.safeParse({
      ...validPayload,
      iat: Date.now(),
      exp: Date.now() + 3600000,
      iss: 'shifty-auth'
    });
    expect(result.success).toBe(true);
  });
});

describe('validateJwtPayload', () => {
  it('should return validated payload for valid input', () => {
    const validPayload = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      role: 'admin',
      email: 'test@example.com'
    };
    const result = validateJwtPayload(validPayload);
    expect(result.userId).toBe(validPayload.userId);
  });

  it('should throw for invalid input', () => {
    expect(() => validateJwtPayload({ userId: 'invalid' })).toThrow();
  });
});

describe('safeValidateJwtPayload', () => {
  it('should return success for valid payload', () => {
    const validPayload = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      role: 'admin',
      email: 'test@example.com'
    };
    const result = safeValidateJwtPayload(validPayload);
    expect(result.success).toBe(true);
  });

  it('should return error for invalid payload', () => {
    const result = safeValidateJwtPayload({ userId: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('sanitizeSelector', () => {
  it('should remove javascript: protocol', () => {
    expect(sanitizeSelector('javascript:alert(1)')).toBe('alert(1)');
  });

  it('should remove data: protocol', () => {
    expect(sanitizeSelector('data:text/html')).toBe('text/html');
  });

  it('should remove event handlers', () => {
    expect(sanitizeSelector('onclick=alert(1)')).toBe('alert(1)');
    expect(sanitizeSelector('onmouseover=evil()')).toBe('evil()');
  });

  it('should remove HTML tags', () => {
    expect(sanitizeSelector('<script>evil()</script>')).toBe('');
    expect(sanitizeSelector('<div>test</div>')).toBe('test');
  });

  it('should remove null bytes', () => {
    expect(sanitizeSelector('test\0value')).toBe('testvalue');
  });

  it('should trim whitespace', () => {
    expect(sanitizeSelector('  .selector  ')).toBe('.selector');
  });

  it('should limit length', () => {
    const longSelector = 'a'.repeat(2000);
    expect(sanitizeSelector(longSelector).length).toBeLessThanOrEqual(RequestLimits.maxSelectorLength);
  });

  it('should handle empty and null values', () => {
    expect(sanitizeSelector('')).toBe('');
    expect(sanitizeSelector(null as any)).toBe('');
    expect(sanitizeSelector(undefined as any)).toBe('');
  });

  it('should preserve valid CSS selectors', () => {
    expect(sanitizeSelector('[data-testid="submit"]')).toBe('[data-testid="submit"]');
    expect(sanitizeSelector('.button.primary')).toBe('.button.primary');
    expect(sanitizeSelector('#main-content')).toBe('#main-content');
  });
});

describe('isUrlAllowed', () => {
  // In non-production mode, all URLs should be allowed
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should allow any URL in development mode', () => {
    process.env.NODE_ENV = 'development';
    expect(isUrlAllowed('https://any-domain.com/path')).toBe(true);
  });

  it('should allow any URL in test mode', () => {
    process.env.NODE_ENV = 'test';
    expect(isUrlAllowed('https://another-domain.org/path')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isUrlAllowed('not-a-url')).toBe(false);
    expect(isUrlAllowed('')).toBe(false);
  });
});

describe('HealSelectorRequestSchema', () => {
  const validRequest = {
    url: 'https://example.com/page',
    brokenSelector: '.button'
  };

  it('should validate a basic heal request', () => {
    const result = HealSelectorRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate with all optional fields', () => {
    const result = HealSelectorRequestSchema.safeParse({
      ...validRequest,
      strategy: 'data-testid-recovery',
      expectedElementType: 'button',
      context: {
        previouslyWorking: true,
        browserType: 'firefox',
        viewport: { width: 1024, height: 768 }
      }
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid strategy', () => {
    const result = HealSelectorRequestSchema.safeParse({
      ...validRequest,
      strategy: 'invalid-strategy'
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid URL', () => {
    const result = HealSelectorRequestSchema.safeParse({
      ...validRequest,
      url: 'not-a-url'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty selector', () => {
    const result = HealSelectorRequestSchema.safeParse({
      ...validRequest,
      brokenSelector: ''
    });
    expect(result.success).toBe(false);
  });

  it('should sanitize selector content', () => {
    const result = HealSelectorRequestSchema.safeParse({
      ...validRequest,
      brokenSelector: '<script>evil()</script>.button'
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.brokenSelector).not.toContain('<script>');
    }
  });
});

describe('GenerateTestRequestSchema', () => {
  const validRequest = {
    url: 'https://example.com/app',
    requirements: 'Test the login functionality with valid credentials'
  };

  it('should validate a basic test generation request', () => {
    const result = GenerateTestRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should apply default values', () => {
    const result = GenerateTestRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.testType).toBe('e2e');
      expect(result.data.browserType).toBe('chromium');
    }
  });

  it('should reject too short requirements', () => {
    const result = GenerateTestRequestSchema.safeParse({
      ...validRequest,
      requirements: 'short'
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid testType', () => {
    const result = GenerateTestRequestSchema.safeParse({
      ...validRequest,
      testType: 'invalid'
    });
    expect(result.success).toBe(false);
  });

  it('should validate all test types', () => {
    const testTypes = ['e2e', 'integration', 'smoke', 'regression'] as const;
    for (const testType of testTypes) {
      const result = GenerateTestRequestSchema.safeParse({
        ...validRequest,
        testType
      });
      expect(result.success).toBe(true);
    }
  });

  it('should validate options', () => {
    const result = GenerateTestRequestSchema.safeParse({
      ...validRequest,
      options: {
        generateVisualTests: true,
        includeAccessibility: true,
        mobileViewport: true,
        timeout: 45000
      }
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid timeout', () => {
    const result = GenerateTestRequestSchema.safeParse({
      ...validRequest,
      options: {
        timeout: 1000 // Too low
      }
    });
    expect(result.success).toBe(false);
  });
});

describe('TenantIdSchema and validateTenantId', () => {
  it('should validate correct UUID', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';
    expect(validateTenantId(validId)).toBe(validId);
  });

  it('should reject invalid UUID', () => {
    expect(() => validateTenantId('not-a-uuid')).toThrow();
  });

  it('should reject empty string', () => {
    expect(() => validateTenantId('')).toThrow();
  });
});

describe('isValidUuid', () => {
  it('should return true for valid UUIDs', () => {
    expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('should return false for invalid UUIDs', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('')).toBe(false);
    expect(isValidUuid('123')).toBe(false);
    expect(isValidUuid(null as any)).toBe(false);
    expect(isValidUuid(undefined as any)).toBe(false);
    expect(isValidUuid(123 as any)).toBe(false);
  });
});

describe('createValidationErrorResponse', () => {
  it('should format Zod errors correctly', () => {
    // Create a mock ZodError
    const result = JwtPayloadSchema.safeParse({ userId: 'invalid' });
    if (!result.success) {
      const response = createValidationErrorResponse(result.error);
      expect(response.error).toBe('Validation failed');
      expect(response.code).toBe('VALIDATION_ERROR');
      expect(response.details).toBeInstanceOf(Array);
      expect(response.details.length).toBeGreaterThan(0);
    }
  });
});

describe('RequestLimits', () => {
  it('should have correct values', () => {
    expect(RequestLimits.bodyLimit).toBe(1048576);
    expect(RequestLimits.requestTimeout).toBe(30000);
    expect(RequestLimits.maxUrlLength).toBe(2048);
    expect(RequestLimits.maxSelectorLength).toBe(1000);
    expect(RequestLimits.maxRequirementsLength).toBe(10000);
  });
});
