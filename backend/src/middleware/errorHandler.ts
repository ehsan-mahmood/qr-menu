import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    sendError(res, 'VALIDATION_ERROR', err.message, 422, err.details);
    return;
  }

  if (err.name === 'UnauthorizedError' || err.message?.includes('token')) {
    sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
    return;
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    sendError(res, 'CONFLICT', 'Resource already exists', 409);
    return;
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    sendError(res, 'BAD_REQUEST', 'Referenced resource does not exist', 400);
    return;
  }

  sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
};

