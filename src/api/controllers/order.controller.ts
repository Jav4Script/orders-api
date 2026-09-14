import { Request, Response, NextFunction } from 'express';

import { OrderUseCase } from '@/application/usecases/order.usecase';
import { toUsersResponseDto } from '@/api/mappers/order.mapper';
import { GetOrdersQuery } from '@/domain/entities/order.entities';
import { saveParsedData } from '@/infrastructure/database/database';
import { FileParser } from '@/infrastructure/services/file-parser.service';
import { Database } from 'sqlite';

const fileParser = new FileParser();

export const createOrderController = (orderUseCase: OrderUseCase, db?: Database) => {
  const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const normalizedData = fileParser.parseAndNormalize(fileContent);
      await saveParsedData(normalizedData, db);

      res.status(201).send({ message: 'File processed and data saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: GetOrdersQuery = req.query;
      const orders = await orderUseCase.getFormattedOrders(filters);
      const formattedOrders = toUsersResponseDto(orders);

      res.status(200).json(formattedOrders);
    } catch (error) {
      next(error);
    }
  };

  return { uploadFile, getOrders };
};
