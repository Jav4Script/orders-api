import { Request, Response, NextFunction } from 'express';
import { parseAndNormalize } from '../services/parser';
import { saveParsedData } from '../services/database';
import { getFormattedOrders } from '../application/orderService';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const normalizedData = parseAndNormalize(fileContent);
    await saveParsedData(normalizedData);

    res.status(201).send({ message: 'File processed and data saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, startDate, endDate, productId, sortBy, sortOrder } = req.query;

    const filters = {
      orderId: orderId ? parseInt(orderId as string, 10) : undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      productId: productId ? parseInt(productId as string, 10) : undefined,
      sortBy: sortBy as 'order_id' | 'total' | 'date' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    };

    const finalResponse = await getFormattedOrders(filters);

    res.status(200).json(finalResponse);
  } catch (error) {
    next(error);
  }
};
