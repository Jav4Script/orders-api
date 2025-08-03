import { Request, Response, NextFunction } from 'express';

import logger from '@/infrastructure/config/logger';

export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Internal Server Error:', err);

  return res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
  });
};
