import { z } from 'zod';

export const getOrdersSchema = z.object({
  query: z.object({
    orderId: z.string().regex(/^\d+$/).optional(),
    productId: z.string().regex(/^\d+$/).optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    sortBy: z.enum(['order_id', 'total', 'date']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
