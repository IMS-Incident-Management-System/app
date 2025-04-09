# Stage 1: Build
FROM node:18-alpine AS builder

# Установим рабочую директорию
WORKDIR /app

# Копируем только package.json и package-lock.json для установки зависимостей
COPY ./package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY . .

# Собираем проект
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

# Копируем только собранные файлы из предыдущего этапа
COPY --from=builder /app/dist ./dist

# Копируем package.json для запуска
COPY --from=builder /app/package*.json ./

# Устанавливаем только production-зависимости
RUN npm install --production

# Открываем порт для работы
EXPOSE 8091

# Запускаем приложение
CMD ["node", "./dist/index.js"]