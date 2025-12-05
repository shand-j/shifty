import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  TenantUtils,
  DatabaseUtils,
  AiUtils,
  SecurityUtils,
  ErrorUtils,
  ValidationUtils,
  DateUtils
} from '../../../../packages/shared/src/utils';

describe('TenantUtils', () => {
  describe('generateTenantId', () => {
    test('should generate a valid UUID', () => {
      const id = TenantUtils.generateTenantId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(id)).toBe(true);
    });

    test('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(TenantUtils.generateTenantId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('createTenantSlug', () => {
    test('should convert name to lowercase slug', () => {
      expect(TenantUtils.createTenantSlug('My Company')).toBe('my-company');
    });

    test('should handle special characters', () => {
      expect(TenantUtils.createTenantSlug('Acme Corp!')).toBe('acme-corp');
    });

    test('should trim whitespace', () => {
      expect(TenantUtils.createTenantSlug('  Trimmed Company  ')).toBe('trimmed-company');
    });

    test('should replace multiple spaces/dashes with single dash', () => {
      expect(TenantUtils.createTenantSlug('Company   With    Spaces')).toBe('company-with-spaces');
    });

    test('should truncate to 50 characters', () => {
      const longName = 'This Is A Very Long Company Name That Should Be Truncated To Fifty Characters Only';
      const slug = TenantUtils.createTenantSlug(longName);
      expect(slug.length).toBeLessThanOrEqual(50);
    });

    test('should handle empty strings', () => {
      expect(TenantUtils.createTenantSlug('')).toBe('');
    });

    test('should handle strings with only special characters', () => {
      expect(TenantUtils.createTenantSlug('!!!@@@###')).toBe('');
    });
  });

  describe('getTenantDatabaseUrl', () => {
    test('should construct proper database URL', () => {
      const tenantId = '12345-abcde';
      const region = 'us-east-1';
      const url = TenantUtils.getTenantDatabaseUrl(tenantId, region);
      
      expect(url).toContain(`shifty-tenant-${tenantId}-db`);
      expect(url).toContain(region);
      expect(url).toContain('rds.amazonaws.com');
      expect(url).toMatch(/^postgresql:\/\//);
    });
  });

  describe('getTenantS3Bucket', () => {
    test('should return proper bucket name format', () => {
      const tenantId = '12345';
      const region = 'us-west-2';
      const bucket = TenantUtils.getTenantS3Bucket(tenantId, region);
      
      expect(bucket).toBe(`shifty-tenant-${tenantId}-${region}`);
    });
  });
});

describe('DatabaseUtils', () => {
  describe('isValidConnection', () => {
    test('should return true for valid PostgreSQL URL', () => {
      expect(DatabaseUtils.isValidConnection('postgresql://user:pass@localhost:5432/db')).toBe(true);
    });

    test('should return false for non-PostgreSQL URLs', () => {
      expect(DatabaseUtils.isValidConnection('mysql://user:pass@localhost:3306/db')).toBe(false);
    });

    test('should return false for invalid URLs', () => {
      expect(DatabaseUtils.isValidConnection('not-a-valid-url')).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(DatabaseUtils.isValidConnection('')).toBe(false);
    });
  });

  describe('extractTenantIdFromUrl', () => {
    test('should extract tenant ID from valid URL', () => {
      const url = 'postgresql://user:pass@shifty-tenant-abc123-def456-db.us-east-1.rds.amazonaws.com:5432/db';
      expect(DatabaseUtils.extractTenantIdFromUrl(url)).toBe('abc123-def456');
    });

    test('should return null for URLs without tenant ID pattern', () => {
      const url = 'postgresql://user:pass@localhost:5432/db';
      expect(DatabaseUtils.extractTenantIdFromUrl(url)).toBeNull();
    });
  });

  describe('createTenantSchema', () => {
    test('should create valid schema name from tenant ID', () => {
      const tenantId = 'abc-123-def-456';
      expect(DatabaseUtils.createTenantSchema(tenantId)).toBe('tenant_abc_123_def_456');
    });
  });
});

describe('AiUtils', () => {
  describe('calculateConfidenceScore', () => {
    test('should calculate average confidence', () => {
      const results = [
        { confidence: 0.8 },
        { confidence: 0.9 },
        { confidence: 0.7 }
      ];
      expect(AiUtils.calculateConfidenceScore(results)).toBe(0.8);
    });

    test('should return 0 for empty array', () => {
      expect(AiUtils.calculateConfidenceScore([])).toBe(0);
    });

    test('should handle results without confidence', () => {
      const results = [{ other: 'data' }, { confidence: 0.5 }];
      expect(AiUtils.calculateConfidenceScore(results)).toBe(0.25);
    });

    test('should round to 2 decimal places', () => {
      const results = [
        { confidence: 0.333 },
        { confidence: 0.666 }
      ];
      expect(AiUtils.calculateConfidenceScore(results)).toBe(0.5);
    });
  });

  describe('sanitizeAiPrompt', () => {
    test('should remove angle brackets', () => {
      const prompt = '<script>alert("xss")</script>';
      expect(AiUtils.sanitizeAiPrompt(prompt)).toBe('scriptalert("xss")/script');
    });

    test('should trim whitespace', () => {
      const prompt = '   test prompt   ';
      expect(AiUtils.sanitizeAiPrompt(prompt)).toBe('test prompt');
    });

    test('should truncate to 4000 characters', () => {
      const longPrompt = 'a'.repeat(5000);
      expect(AiUtils.sanitizeAiPrompt(longPrompt).length).toBe(4000);
    });
  });

  describe('extractCodeFromResponse', () => {
    test('should extract TypeScript code block', () => {
      const response = 'Here is the code:\n```typescript\nconst x = 1;\n```\nDone.';
      expect(AiUtils.extractCodeFromResponse(response)).toBe('const x = 1;');
    });

    test('should extract JavaScript code block', () => {
      const response = '```javascript\nfunction test() {}\n```';
      expect(AiUtils.extractCodeFromResponse(response)).toBe('function test() {}');
    });

    test('should return trimmed response if no code block', () => {
      const response = '  just plain text  ';
      expect(AiUtils.extractCodeFromResponse(response)).toBe('just plain text');
    });

    test('should handle code block without language specifier', () => {
      const response = '```\ncode here\n```';
      expect(AiUtils.extractCodeFromResponse(response)).toBe('code here');
    });
  });
});

describe('SecurityUtils', () => {
  describe('hashTenantData', () => {
    test('should return consistent hash for same input', () => {
      const data = 'sensitive-data';
      const tenantId = 'tenant-123';
      const hash1 = SecurityUtils.hashTenantData(data, tenantId);
      const hash2 = SecurityUtils.hashTenantData(data, tenantId);
      expect(hash1).toBe(hash2);
    });

    test('should return different hash for different tenant', () => {
      const data = 'sensitive-data';
      const hash1 = SecurityUtils.hashTenantData(data, 'tenant-1');
      const hash2 = SecurityUtils.hashTenantData(data, 'tenant-2');
      expect(hash1).not.toBe(hash2);
    });

    test('should return 64 character hex string', () => {
      const hash = SecurityUtils.hashTenantData('data', 'tenant');
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('validateTenantAccess', () => {
    test('should return true when user belongs to tenant', () => {
      expect(SecurityUtils.validateTenantAccess('user-1', 'tenant-1', 'tenant-1')).toBe(true);
    });

    test('should return false when user does not belong to tenant', () => {
      expect(SecurityUtils.validateTenantAccess('user-1', 'tenant-1', 'tenant-2')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    test('should escape HTML entities', () => {
      expect(SecurityUtils.sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    test('should escape ampersand', () => {
      expect(SecurityUtils.sanitizeInput('foo & bar')).toBe('foo &amp; bar');
    });

    test('should escape single quotes', () => {
      expect(SecurityUtils.sanitizeInput("it's")).toBe("it&#x27;s");
    });

    test('should handle empty string', () => {
      expect(SecurityUtils.sanitizeInput('')).toBe('');
    });

    test('should leave safe characters unchanged', () => {
      expect(SecurityUtils.sanitizeInput('Hello World 123')).toBe('Hello World 123');
    });
  });
});

describe('ErrorUtils', () => {
  describe('createApiError', () => {
    test('should create error object with all fields', () => {
      const error = ErrorUtils.createApiError('Something went wrong', 'ERR_001', 400);
      
      expect(error.success).toBe(false);
      expect(error.error.message).toBe('Something went wrong');
      expect(error.error.code).toBe('ERR_001');
      expect(error.error.statusCode).toBe(400);
      expect(error.error.timestamp).toBeDefined();
    });

    test('should default to 500 status code', () => {
      const error = ErrorUtils.createApiError('Error', 'ERR');
      expect(error.error.statusCode).toBe(500);
    });
  });

  describe('isTenantError', () => {
    test('should return true for tenant errors', () => {
      expect(ErrorUtils.isTenantError({ code: 'TENANT_NOT_FOUND' })).toBe(true);
      expect(ErrorUtils.isTenantError({ code: 'TENANT_SUSPENDED' })).toBe(true);
    });

    test('should return false for non-tenant errors', () => {
      expect(ErrorUtils.isTenantError({ code: 'AUTH_ERROR' })).toBe(false);
      expect(ErrorUtils.isTenantError({ code: undefined })).toBe(false);
      expect(ErrorUtils.isTenantError(null)).toBe(false);
    });
  });

  describe('logError', () => {
    let consoleSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    test('should log error with context', () => {
      const error = new Error('Test error');
      ErrorUtils.logError(error, { userId: '123' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          context: { userId: '123' }
        })
      );
    });

    test('should include timestamp', () => {
      const error = new Error('Test');
      ErrorUtils.logError(error);
      
      const loggedData = consoleSpy.mock.calls[0][0] as any;
      expect(loggedData.timestamp).toBeDefined();
    });
  });
});

describe('ValidationUtils', () => {
  describe('isValidEmail', () => {
    test('should return true for valid emails', () => {
      expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('should return false for invalid emails', () => {
      expect(ValidationUtils.isValidEmail('invalid')).toBe(false);
      expect(ValidationUtils.isValidEmail('missing@domain')).toBe(false);
      expect(ValidationUtils.isValidEmail('@nodomain.com')).toBe(false);
      expect(ValidationUtils.isValidEmail('spaces @domain.com')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    test('should return true for valid UUIDs', () => {
      expect(ValidationUtils.isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(ValidationUtils.isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    test('should return false for invalid UUIDs', () => {
      expect(ValidationUtils.isValidUUID('invalid')).toBe(false);
      expect(ValidationUtils.isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(ValidationUtils.isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    test('should return true for valid URLs', () => {
      expect(ValidationUtils.isValidUrl('https://example.com')).toBe(true);
      expect(ValidationUtils.isValidUrl('http://localhost:3000')).toBe(true);
      expect(ValidationUtils.isValidUrl('ftp://files.example.com')).toBe(true);
    });

    test('should return false for invalid URLs', () => {
      expect(ValidationUtils.isValidUrl('not-a-url')).toBe(false);
      expect(ValidationUtils.isValidUrl('')).toBe(false);
    });
  });
});

describe('DateUtils', () => {
  describe('formatDate', () => {
    test('should format Date object', () => {
      const date = new Date('2024-06-15T10:30:00Z');
      const formatted = DateUtils.formatDate(date);
      // Note: Formatting may differ based on timezone
      expect(formatted).toMatch(/2024-06-15/);
    });

    test('should format ISO string', () => {
      const formatted = DateUtils.formatDate('2024-06-15T10:30:00Z');
      expect(formatted).toMatch(/2024-06-15/);
    });

    test('should return empty string for invalid date', () => {
      expect(DateUtils.formatDate('invalid')).toBe('');
    });
  });

  describe('addDays', () => {
    test('should add positive days', () => {
      const date = new Date('2024-01-15');
      const result = DateUtils.addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    test('should subtract days with negative number', () => {
      const date = new Date('2024-01-15');
      const result = DateUtils.addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    test('should handle month boundaries', () => {
      const date = new Date('2024-01-30');
      const result = DateUtils.addDays(date, 3);
      expect(result.getMonth()).toBe(1); // February
    });
  });

  describe('isExpired', () => {
    test('should return true for past date', () => {
      const pastDate = new Date('2020-01-01');
      expect(DateUtils.isExpired(pastDate)).toBe(true);
    });

    test('should return false for future date', () => {
      const futureDate = new Date('2030-01-01');
      expect(DateUtils.isExpired(futureDate)).toBe(false);
    });
  });
});
