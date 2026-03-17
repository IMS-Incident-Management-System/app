import express from 'express';
import cors from 'cors';
import { verifyToken } from './src/middlewares/auth.middleware';
import dotenv from 'dotenv';
import router from './src/routes/routes';
import { sequelize } from './src/models/sequelize';
import { errorHandler } from './src/middlewares/errorHandler.middleware';
import { responseHandler } from './src/middlewares/responseHandler.middleware';
import { runSeeders } from './src/seeders';
import { runMigrations } from './src/utils/migrations';
import { ensureFirstAdmin } from './src/scripts/ensureFirstAdmin';
import https from 'https';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 8091;

const createApp = () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // CORS handled by nginx in development, by backend in production
  if (process.env.NODE_ENV === 'production') {
    app.use(cors({
      origin: ['https://ims-mts.ru', 'https://www.ims-mts.ru'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
    }));
  } else {
    // В development режиме разрешаем все CORS запросы
    app.use(cors({ 
      origin: true,  // Разрешить все домены
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
    }));
  }

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
    // Создаем директорию для загрузки файлов, если её нет
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'incidents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`📁 Создана директория для загрузки файлов: ${uploadDir}`);
    }

    // Инициализируем приложение
    const application = createApp();

    // Проверяем подключение к БД
    const dbConnected = await testDbConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Применяем миграции БД
    await runMigrations();

    // Синхронизируем модели с БД
    // В продакшене используем sync без alter для избежания блокировок
    await sequelize.sync({ alter: false });

    // Запускаем сидеры
    await runSeeders();
    console.log('Seeders completed');

    // Опционально: назначить первого админа по FIRST_ADMIN_EXTERNAL_ID (Keycloak sub)
    await ensureFirstAdmin();

    // SSL configuration
    const sslOptions = process.env.NODE_ENV === 'production'
      ? {
        key: fs.readFileSync(path.join('/app/certs/live/ims-mts.ru/privkey.pem')),
        cert: fs.readFileSync(path.join('/app/certs/live/ims-mts.ru/fullchain.pem'))
      }
      : undefined;

    // Запускаем сервер
    if (!sslOptions) {
      application.listen(PORT, () => {
        console.log(`API is available at http://localhost:${PORT}/api/v1`);
      });
    } else {
      const server = https.createServer(sslOptions, application);
      server.listen(PORT, () => {
        console.log(`Production HTTPS server is running on port ${PORT}`);
        console.log(`API is available at https://ims-mts.ru:${PORT}/api/v1`);
      });
    }
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
