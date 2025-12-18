import multer from 'multer';
import { Request } from 'express';
import { ApiError } from './errorHandler.middleware';
import { MulterRequest } from '../types/multer';

// Настройка multer для хранения файлов в памяти
const storage = multer.memoryStorage();

// Фильтр файлов
const fileFilter = (req: Request, file: any, cb: multer.FileFilterCallback) => {
  // Разрешаем все типы файлов
  cb(null, true);
};

// Настройка multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 МБ максимум на файл
    files: 10, // Максимум 10 файлов
  },
});

// Middleware для проверки количества файлов
export const validateFileCount = (req: MulterRequest, res: any, next: any) => {
  const files = req.files;
  
  if (!files || files.length === 0) {
    return next();
  }

  if (files.length > 10) {
    return next(ApiError.badRequest('Максимальное количество файлов: 10'));
  }

  // Проверяем размер каждого файла
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      return next(ApiError.badRequest(`Файл "${file.originalname}" превышает максимальный размер 5 МБ`));
    }
  }

  next();
};

