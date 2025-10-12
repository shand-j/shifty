import { describe, test, expect, beforeAll } from '@jest/globals';
import { APIClient, TestDataFactory, APIAssertions, AuthResponse } from '../../utils/api-client';
import { TEST_CONFIG } from '../../config/api-test.config';

describe('Auth Service API', () => {
  let apiClient: APIClient;
  let testUser: ReturnType<typeof TestDataFactory.createTestUser>;

  beforeAll(() => {
    apiClient = new APIClient();
    testUser = TestDataFactory.createTestUser();
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await apiClient.getServiceHealth(TEST_CONFIG.PORTS.AUTH_SERVICE);
      
      APIAssertions.expectValidHealthResponse(response, TEST_CONFIG.SERVICE_NAMES.AUTH_SERVICE);
      expect(response.timestamp).toBeTruthy();
    });
  });

  describe('User Registration', () => {
    test('should register new user and create tenant', async () => {
      const response = await apiClient.registerUser(testUser);
      
      APIAssertions.expectValidAuthResponse(response);
      expect(response.user.email).toBe(testUser.email);
      expect(response.user.role).toBe('owner');
      expect(response.tenant.name).toBe(testUser.tenantName);
      expect(response.tenant.plan).toBe('starter');
      expect(response.tenant.status).toBe('active');
    });

    test('should fail with duplicate email', async () => {
      // Try to register the same user again
      try {
        await apiClient.registerUser(testUser);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(409); // Service returns 409 Conflict for duplicate email
        expect(error.response.data).toHaveProperty('error');
      }
    });

    test('should validate required fields', async () => {
      const incompleteUser = {
        email: 'test@example.com',
        password: 'weak',
        firstName: '',
        lastName: '',
        tenantName: '',
      };

      try {
        await apiClient.registerUser(incompleteUser);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    test('should validate email format', async () => {
      const invalidEmailUser = {
        ...testUser,
        email: 'invalid-email',
      };

      try {
        await apiClient.registerUser(invalidEmailUser);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('User Authentication', () => {
    let authResponse: AuthResponse;

    beforeAll(async () => {
      // Register a user for login tests
      const uniqueUser = TestDataFactory.createTestUser('login-test');
      authResponse = await apiClient.registerUser(uniqueUser);
    });

    test('should authenticate with valid credentials', async () => {
      const loginResponse = await apiClient.loginUser(
        authResponse.user.email,
        'TestPassword123!'
      );

      APIAssertions.expectValidLoginResponse(loginResponse);
      expect(loginResponse.user.id).toBe(authResponse.user.id);
      expect(loginResponse.user.email).toBe(authResponse.user.email);
    });

    test('should fail with invalid password', async () => {
      try {
        await apiClient.loginUser(authResponse.user.email, 'wrongpassword');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should fail with non-existent email', async () => {
      try {
        await apiClient.loginUser('nonexistent@example.com', 'password');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Token Verification', () => {
    let validToken: string;

    beforeAll(async () => {
      const uniqueUser = TestDataFactory.createTestUser('token-test');
      const authResponse = await apiClient.registerUser(uniqueUser);
      validToken = authResponse.token;
    });

    test('should verify valid JWT token', async () => {
      const verificationResponse = await apiClient.verifyToken(validToken);
      
      expect(verificationResponse).toHaveProperty('valid');
      expect(verificationResponse).toHaveProperty('user');
      expect(verificationResponse.valid).toBe(true);
      expect(verificationResponse.user).toHaveProperty('id');
      expect(verificationResponse.user).toHaveProperty('email');
      expect(verificationResponse.user).toHaveProperty('role');
      expect(verificationResponse.user).toHaveProperty('tenantId');
    });

    test('should fail with invalid token', async () => {
      try {
        await apiClient.verifyToken('invalid-token');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should fail with malformed token', async () => {
      try {
        await apiClient.verifyToken('malformed.jwt.token');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('JWT Token Structure', () => {
    test('should generate valid JWT structure', async () => {
      const uniqueUser = TestDataFactory.createTestUser('jwt-test');
      const response = await apiClient.registerUser(uniqueUser);
      
      APIAssertions.expectValidJWT(response.token);
      
      // Decode JWT header to verify structure
      const [header, payload, signature] = response.token.split('.');
      
      expect(header).toBeTruthy();
      expect(payload).toBeTruthy();
      expect(signature).toBeTruthy();
      
      // Decode payload (base64)
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      expect(decodedPayload).toHaveProperty('userId');
      expect(decodedPayload).toHaveProperty('email');
      expect(decodedPayload).toHaveProperty('role');
      expect(decodedPayload).toHaveProperty('iat'); // issued at
      expect(decodedPayload).toHaveProperty('exp'); // expires
      expect(decodedPayload).toHaveProperty('iss'); // issuer
      
      expect(decodedPayload.iss).toBe('shifty-auth');
    });
  });
});