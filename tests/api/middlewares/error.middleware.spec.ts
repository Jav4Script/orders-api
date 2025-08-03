import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '@/api/middlewares/error.middleware';

describe('Error Middleware', () => {
  it('should handle a generic error', () => {
    const err = new Error('Test Error');
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal Server Error' }));
  });
});
