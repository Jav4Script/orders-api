import dotenv from 'dotenv';

import { createApp } from './app';
import logger from './infrastructure/config/logger';
import { initializeDatabase } from './infrastructure/database/database';
import { SqliteOrderRepository } from './infrastructure/database/order.repository';
import { OrderUseCase } from './application/usecases/order.usecase';

dotenv.config();

const startServer = async () => {
  try {
    await initializeDatabase();

    const orderRepository = new SqliteOrderRepository();
    const orderUseCase = new OrderUseCase(orderRepository);

    const app = createApp(orderUseCase);
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
