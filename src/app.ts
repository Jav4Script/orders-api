import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { createRouter } from './api/routes';
import { errorMiddleware } from './api/middlewares/error.middleware';
import { swaggerSpec } from './infrastructure/config/swagger';
import { OrderUseCase } from './application/usecases/order.usecase';

export const createApp = (orderUseCase: OrderUseCase) => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', createRouter(orderUseCase));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorMiddleware);

  return app;
};
