import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Получаем список файлов с роутами
const routeFiles = fs
  .readdirSync(__dirname)
  .filter(file => file.endsWith('.routes.ts') && file !== 'routes.ts');

// Используем синхронный require вместо асинхронного import
routeFiles.forEach((file) => {
  const routePath = path.join(__dirname, file);
  const route = require(routePath).default;
  router.use('/', route);
});

export default router;
