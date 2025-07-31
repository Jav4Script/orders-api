import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../../config/logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    logger.warn('Validation error:', err.issues);
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues,
    });
  }

  logger.error('Internal Server Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
  });
};