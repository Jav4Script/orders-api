import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '@/api/middlewares/validate.middleware';

describe('Validate Middleware', () => {
  const schema = z.object({
    query: z.object({
      name: z.string(),
    }),
  });

  it('should call next if validation passes', async () => {
    const req = { query: { name: 'test' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should return 400 if validation fails', async () => {
    const req = { query: { name: 123 } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await validate(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it('should call next with an error if a non-ZodError occurs', async () => {
    const req = { query: { name: 'test' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    // Mock the schema.parse to throw a generic error
    const mockSchema = {
      parse: jest.fn(() => {
        throw new Error('Generic error');
      }),
    } as unknown as typeof schema;

    await validate(mockSchema)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
