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
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token is required'
    });
  }

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