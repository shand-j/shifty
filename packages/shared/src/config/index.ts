/**
 * Centralized Configuration Module for Shifty Platform
 * 
 * This module provides secure configuration management for all services.
 * It validates required environment variables in production and provides
 * safe defaults for development.
 */

const DEFAULT_DEV_JWT_SECRET = 'dev-secret-change-in-production';
const DEFAULT_DEV_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/shifty_platform';

/**
 * Validates that required secrets are properly configured in production.
 * Throws an error if critical configuration is missing or insecure.
 */
export function validateProductionConfig(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Validate JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('SECURITY ERROR: JWT_SECRET environment variable is required in production');
    }
    if (jwtSecret === DEFAULT_DEV_JWT_SECRET || jwtSecret.includes('dev-secret')) {
      throw new Error('SECURITY ERROR: JWT_SECRET contains development value. Use a strong, randomly generated secret in production.');
    }
    if (jwtSecret.length < 32) {
      throw new Error('SECURITY ERROR: JWT_SECRET must be at least 32 characters long');
    }

    // Validate database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('SECURITY ERROR: DATABASE_URL environment variable is required in production');
    }
    if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
      throw new Error('SECURITY ERROR: DATABASE_URL should not point to localhost in production');
    }
    if (databaseUrl.includes('postgres:postgres@')) {
      throw new Error('SECURITY ERROR: DATABASE_URL contains default credentials. Use secure credentials in production.');
    }
  }
}

/**
 * Configuration object for JWT authentication.
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  issuer: string;
}

/**
 * Configuration object for database connections.
 */
export interface DatabaseConfigOptions {
  connectionString: string;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

/**
 * Gets the JWT configuration with proper validation.
 * In production, requires JWT_SECRET to be set.
 * In development, uses a default value but logs a warning.
 */
export function getJwtConfig(): JwtConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = process.env.JWT_SECRET;

  if (isProduction && (!secret || secret === DEFAULT_DEV_JWT_SECRET)) {
    throw new Error('SECURITY ERROR: JWT_SECRET must be set to a secure value in production');
  }

  if (!isProduction && !secret) {
    console.warn('⚠️  WARNING: Using default JWT secret for development. Set JWT_SECRET environment variable for production.');
  }

  return {
    secret: secret || DEFAULT_DEV_JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'shifty-auth'
  };
}

/**
 * Gets the database configuration with proper validation.
 * In production, requires DATABASE_URL to be set.
 * In development, uses a default value but logs a warning.
 */
export function getDatabaseConfig(): DatabaseConfigOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const connectionString = process.env.DATABASE_URL;

  if (isProduction && !connectionString) {
    throw new Error('SECURITY ERROR: DATABASE_URL must be set in production');
  }

  if (!isProduction && !connectionString) {
    console.warn('⚠️  WARNING: Using default database URL for development. Set DATABASE_URL environment variable for production.');
  }

  return {
    connectionString: connectionString || DEFAULT_DEV_DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
  };
}

/**
 * Gets a tenant database URL using environment configuration.
 * Never uses hardcoded credentials in production.
 */
export function getTenantDatabaseUrl(tenantId: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const tenantDbHost = process.env.TENANT_DB_HOST || 'localhost';
  const tenantDbPort = process.env.TENANT_DB_PORT || '5432';
  const tenantDbUser = process.env.TENANT_DB_USER || 'tenant';
  const tenantDbPassword = process.env.TENANT_DB_PASSWORD || 'password';

  if (isProduction) {
    if (!process.env.TENANT_DB_HOST || !process.env.TENANT_DB_PASSWORD) {
      throw new Error('SECURITY ERROR: TENANT_DB_HOST and TENANT_DB_PASSWORD must be set in production');
    }
    if (tenantDbPassword === 'password') {
      throw new Error('SECURITY ERROR: TENANT_DB_PASSWORD cannot be "password" in production');
    }
  }

  return `postgresql://${tenantDbUser}:${tenantDbPassword}@${tenantDbHost}:${tenantDbPort}/tenant_${tenantId}`;
}

/**
 * Export all configuration functions for easy import
 */
export const Config = {
  validateProduction: validateProductionConfig,
  getJwt: getJwtConfig,
  getDatabase: getDatabaseConfig,
  getTenantDatabaseUrl,
};
