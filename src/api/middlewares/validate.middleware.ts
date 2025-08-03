import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject, ZodRawShape } from 'zod';

export const validate =
  <T extends ZodRawShape>(schema: ZodObject<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Input validation failed',
          errors: error.issues,
        });
      }
      next(error);
    }
  };
