# 🔄 Автоматическая система миграций

## Обзор

Этот проект использует автоматическую систему управления миграциями базы данных. Миграции применяются автоматически при каждом запуске приложения.

## Как это работает

### Архитектура

```
┌─────────────────────────────────────────┐
│  Запуск приложения (index.ts)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  runMigrations() проверяет:             │
│  1. Есть ли таблица migrations?         │
│  2. Какие миграции уже применены?       │
│  3. Какие файлы есть в migrations/?     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Применяются только новые миграции      │
│  (которых нет в таблице migrations)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Записывается информация о применении   │
│  в таблицу migrations                   │
└─────────────────────────────────────────┘
```

### Таблица отслеживания миграций

Система автоматически создаёт таблицу `migrations`:

```sql
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Эта таблица хранит:
- Имя файла миграции
- Дату и время применения

### Файлы миграций

Миграции хранятся в директории `migrations/` и должны иметь формат:
- `001_description.sql`
- `002_another_migration.sql`
- `003_more_changes.sql`

Миграции применяются в алфавитном порядке (по номеру).

## Процесс в CI/CD Pipeline

### 1. Разработчик создаёт миграцию

```bash
cd app/backend/migrations
echo "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);" > 003_add_email_field.sql
git add .
git commit -m "feat: add email field to users table"
git push
```

### 2. Pipeline собирает Docker образ

```dockerfile
# Dockerfile копирует директорию migrations
COPY --from=builder /app/migrations ./migrations
```

### 3. Деплой на сервер

```bash
docker-compose up -d --build ims-backend
```

### 4. Автоматическое применение

При старте контейнера:
```
🔄 Проверка миграций...
✅ Таблица migrations создана
📊 Применённых миграций: 2
📁 Найдено файлов миграций: 3
🚀 Найдено неприменённых миграций: 1
📄 Применение миграции: 003_add_email_field.sql
✅ Миграция 003_add_email_field.sql успешно применена
✅ Все миграции успешно применены
```

## Преимущества

✅ **Автоматизация** - не нужно помнить о ручном применении миграций
✅ **Безопасность** - каждая миграция применяется только один раз
✅ **Идемпотентность** - безопасно перезапускать приложение
✅ **Отслеживание** - видна история всех применённых миграций
✅ **CI/CD готовность** - работает из коробки в пайплайне
✅ **Простота** - просто добавьте SQL файл и закоммитьте

## Команды для управления

```bash
# Проверить статус миграций
npm run migrate:status

# Применить миграции вручную (без запуска приложения)
npm run migrate:up

# В Docker контейнере
docker exec -it ims-backend npm run migrate:status
docker exec -it ims-backend npm run migrate:up

# Проверить таблицу миграций в БД
docker exec -it ims-postgres psql -U admin -d ims -c "SELECT * FROM migrations ORDER BY applied_at;"
```

## Примеры миграций

### Добавление колонки

```sql
-- Миграция: Добавление email для пользователей
-- Дата: 2024-01-15

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

COMMENT ON COLUMN users.email IS 'Email пользователя';
COMMENT ON COLUMN users.phone IS 'Телефон пользователя';
```

### Создание новой таблицы

```sql
-- Миграция: Создание таблицы логов
-- Дата: 2024-01-16

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

COMMENT ON TABLE audit_logs IS 'Логи действий пользователей';
```

### Удаление устаревших данных

```sql
-- Миграция: Удаление устаревших полей
-- Дата: 2024-01-17

ALTER TABLE users 
DROP COLUMN IF EXISTS old_field,
DROP COLUMN IF EXISTS deprecated_field;
```

## Безопасность

### Резервное копирование перед миграциями

Рекомендуется создавать бэкап перед применением сложных миграций:

```bash
# Создать бэкап
docker exec ims-postgres pg_dump -U admin ims > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа при необходимости
docker exec -i ims-postgres psql -U admin -d ims < backup_20240115_143022.sql
```

### Идемпотентность

Все миграции должны быть идемпотентными (безопасно применять повторно):

✅ **Хорошо:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
CREATE TABLE IF NOT EXISTS logs (...);
DROP TABLE IF EXISTS old_table;
```

❌ **Плохо:**
```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255);  -- упадёт если колонка уже есть
CREATE TABLE logs (...);  -- упадёт если таблица уже есть
DROP TABLE old_table;  -- упадёт если таблицы нет
```

## Устранение проблем

### Миграция не применилась

1. Проверьте логи запуска приложения:
   ```bash
   docker logs -f ims-backend
   ```

2. Проверьте статус миграций:
   ```bash
   docker exec -it ims-backend npm run migrate:status
   ```

3. Попробуйте применить вручную:
   ```bash
   docker exec -it ims-backend npm run migrate:up
   ```

### Ошибка в миграции

Если миграция содержит ошибку и не применилась:

1. Исправьте SQL в файле миграции
2. Перезапустите приложение или выполните `npm run migrate:up`
3. Система попытается применить миграцию снова

### Откат миграции

Система не поддерживает автоматический откат. Для отката:

1. Создайте новую миграцию с обратными изменениями
2. Или восстановите БД из бэкапа

## Интеграция с существующими проектами

Если вы добавляете эту систему в существующий проект с БД:

1. Все существующие таблицы останутся без изменений
2. Создайте миграции для будущих изменений
3. Система начнёт отслеживать новые миграции

Если нужно зафиксировать текущее состояние БД:

```bash
# Экспортируйте схему БД
docker exec ims-postgres pg_dump -U admin -s ims > 001_initial_schema.sql

# Добавьте в начало файла IF NOT EXISTS для всех объектов
```

## Дополнительная информация

- Полная документация: [README.md](./README.md)
- Исходный код системы: `src/utils/migrations.ts`
- Скрипт управления: `src/scripts/migrate.ts`





