# Stage 1: Build
FROM node:18-alpine AS builder

# Установим рабочую директорию
WORKDIR /app

<<<<<<< Updated upstream
=======
# В контуре без доступа к registry.npmjs.org задайте при сборке:
#   docker compose build --build-arg NPM_REGISTRY=https://<ваш-nexus>/repository/npm-public/
ARG NPM_REGISTRY
RUN if [ -n "$NPM_REGISTRY" ]; then npm config set registry "$NPM_REGISTRY" && npm config set strict-ssl false; fi

>>>>>>> Stashed changes
# Копируем только package.json и package-lock.json для установки зависимостей
COPY ./backend/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY ./backend .

# Удаляем старые файлы с неправильным регистром (если они есть)
RUN rm -f src/models/CriminalCase.ts src/models/Punishment.ts src/models/IncidentAddress.ts src/models/IncidentPerson.ts || true

# Собираем проект
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

<<<<<<< Updated upstream
=======
ARG NPM_REGISTRY
RUN if [ -n "$NPM_REGISTRY" ]; then npm config set registry "$NPM_REGISTRY" && npm config set strict-ssl false; fi

>>>>>>> Stashed changes
# Копируем только собранные файлы из предыдущего этапа
COPY --from=builder /app/dist ./dist

# Копируем директорию миграций (нужна для автоматического применения)
COPY --from=builder /app/migrations ./migrations

# Копируем package.json для запуска
COPY --from=builder /app/package*.json ./

# Устанавливаем только production-зависимости
RUN npm install --production

# Открываем порт для работы
EXPOSE 8091

# Запускаем приложение
CMD ["node", "./dist/index.js"]