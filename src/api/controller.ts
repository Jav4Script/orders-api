import { Request, Response, NextFunction } from 'express';
import { parseAndNormalize } from '../services/parser';
import { saveParsedData, findOrdersByFilter } from '../services/database';

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

    const flatOrders = await findOrdersByFilter(filters);

    // Re-group flat data into nested structure
    const usersMap = new Map();
    for (const row of flatOrders) {
      let user = usersMap.get(row.user_id);
      if (!user) {
        user = { user_id: row.user_id, name: row.name, orders: [] };
        usersMap.set(row.user_id, user);
      }

      let order = user.orders.find((o: any) => o.order_id === row.order_id);
      if (!order) {
        order = { order_id: row.order_id, total: row.total, date: row.date, products: [] };
        user.orders.push(order);
      }

      order.products.push({ product_id: row.product_id, value: row.value.toFixed(2) });
    }

    res.status(200).json(Array.from(usersMap.values()));
  } catch (error) {
    next(error);
  }
};
