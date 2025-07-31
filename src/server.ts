import express from 'express';
import apiRoutes from './api/routes';
import { initializeDatabase } from './services/database';
import { errorMiddleware } from './api/middlewares/error.middleware';
import logger from './config/logger';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', apiRoutes);
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
