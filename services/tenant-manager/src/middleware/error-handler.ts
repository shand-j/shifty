import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (error.statusCode) {
    statusCode = error.statusCode;
    // Keep the original message if we have a custom status code
  } else if (error.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (error.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Invalid reference to related resource';
  } else if (error.code === '23502') { // PostgreSQL not null violation
    statusCode = 400;
    message = 'Required field missing';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.message.includes('unauthorized')) {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (error.message.includes('forbidden')) {
    statusCode = 403;
    message = 'Forbidden access';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
}