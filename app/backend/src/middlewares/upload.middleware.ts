import multer from 'multer';
import { Request } from 'express';
import { ApiError } from './errorHandler.middleware';
import { MulterRequest } from '../types/multer';
import path from 'path';
import fs from 'fs';

// Директория для хранения файлов
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Создаем директории для разных типов вложений
const INCIDENTS_UPLOAD_DIR = path.join(UPLOAD_DIR, 'incidents');
const INCIDENT_EVENTS_UPLOAD_DIR = path.join(UPLOAD_DIR, 'incident-events');

// Создаем директории, если их нет
[UPLOAD_DIR, INCIDENTS_UPLOAD_DIR, INCIDENT_EVENTS_UPLOAD_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Настройка multer для хранения файлов на диске
const diskStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // Определяем директорию в зависимости от пути запроса
    const url = req.originalUrl || req.url || '';
    let uploadDir: string;
    
    if (url.includes('/incident-events/')) {
      uploadDir = INCIDENT_EVENTS_UPLOAD_DIR;
    } else {
      uploadDir = INCIDENTS_UPLOAD_DIR;
    }
    
    // Убеждаемся, что директория существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    console.log(`Multer: Saving file to directory: ${uploadDir}, URL: ${url}`);
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${fileExtension}`;
    console.log(`Multer: Generated filename: ${filename} for file: ${file.originalname}`);
    cb(null, filename);
  },
});

// Фильтр файлов
const fileFilter = (req: Request, file: any, cb: multer.FileFilterCallback) => {
  // Разрешаем все типы файлов
  cb(null, true);
};

// Настройка multer
export const upload = multer({
  storage: diskStorage,
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

