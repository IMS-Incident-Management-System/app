import express from 'express';
import cors from 'cors';
import { verifyToken } from './src/middlewares/auth.middleware';
import dotenv from 'dotenv';
import router from './src/routes/routes';
import { sequelize } from './src/models/sequelize';
import { errorHandler } from './src/middlewares/errorHandler.middleware';
import { responseHandler } from './src/middlewares/responseHandler.middleware';
import { runSeeders } from './src/seeders';

dotenv.config();

const app = express();
const PORT = 8091;

const createApp = () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Базовый роут для проверки работы сервера
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(responseHandler);
  app.use('/api/v1', router);
  app.use(errorHandler);

  return app;
};

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

const startServer = async () => {
  try {
    // Инициализируем приложение
    const application = createApp();

    // Проверяем подключение к БД
    const dbConnected = await testDbConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Синхронизируем модели с БД
    await sequelize.sync({ alter: true, force: true }); //, force: true
    console.log('Database synchronized');

    // Запускаем сидеры
    await runSeeders();
    console.log('Seeders completed');

    // Запускаем сервер
    application.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API is available at http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Обработка необработанных ошибок
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
