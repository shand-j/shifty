import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenantId?: string;
    role?: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  // CRITICAL: Hardcoded JWT secret - SECURITY VULNERABILITY
  // FIXME: Same secret must be used across all services
  // TODO: Centralize secret management, load from shared config
  // Effort: 30 minutes | Priority: CRITICAL
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without authentication
  }

  // CRITICAL: Hardcoded JWT secret - centralize with authenticateToken
  // Effort: 30 minutes | Priority: CRITICAL
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      role: decoded.role
    };
  } catch (error) {
    // Token invalid but continue - user will be undefined
  }

  next();
}