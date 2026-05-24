# Миграции базы данных

Этот каталог содержит SQL миграции для базы данных PostgreSQL.

## 🚀 Автоматическое применение миграций

**Миграции применяются автоматически при запуске приложения!**

Система миграций:
- ✅ Автоматически применяет только новые миграции
- ✅ Отслеживает уже применённые миграции в таблице `migrations`
- ✅ Безопасно пропускает уже применённые файлы
- ✅ Применяет миграции в правильном порядке (по имени файла)
- ✅ Работает в CI/CD пайплайне автоматически при деплое
- ✅ Не требует ручного вмешательства

### Как это работает в пайплайне

При деплое новой версии приложения:
1. Docker контейнер собирается с новым кодом и файлами миграций
2. При старте контейнера автоматически запускается проверка миграций
3. Система сравнивает файлы в `migrations/` с записями в таблице `migrations`
4. Применяются только новые миграции (которых еще нет в БД)
5. Приложение запускается с актуальной схемой БД

**Вам нужно только:**
- Добавить новый SQL файл в `migrations/` с именем вида `XXX_description.sql`
- Закоммитить и запушить в репозиторий
- Миграция применится автоматически при следующем деплое!

### Ручное управление миграциями

Если нужно применить миграции вручную (без запуска приложения):

```bash
# Применить все неприменённые миграции
npm run migrate:up

# Посмотреть статус миграций
npm run migrate:status
```

### Проверка статуса в Docker

```bash
# В контейнере
docker exec -it ims-backend npm run migrate:status

# Применить миграции вручную в контейнере
docker exec -it ims-backend npm run migrate:up
```

## 📋 Список миграций

### 001_add_new_incident_fields.sql
Добавляет новые поля и таблицы для расширенной работы с инцидентами:
- Новые поля в таблицу `incidents`:
  - `description` - описание инцидента
  - `source_last_name`, `source_first_name`, `source_middle_name`, `source_position` - данные источника информации
- Таблица `incident_addresses` - адреса инцидентов
- Таблица `incident_persons` - персональные данные связанные с инцидентами
- Таблица `criminal_cases` - уголовные дела
- Таблица `punishments` - наказания
- Удаляет устаревшие поля `criminal_cases` и `is_punished` из таблицы `additionally`

### 002_fix_criminal_and_punishment_tables.sql
Пересоздает таблицы `criminal_cases` и `punishments` с правильной структурой (добавляет связь с `additionally_id`).

### 003_align_criminal_punishment_with_models.sql
Приводит схему таблиц к актуальным моделям:
- `criminal_cases`: добавлены поля `rejection_date`, `rejection_reason`, `appeal_date`, `case_date`, `initiator`, `subject`, `detained_count`, `case_result`, `court_decision`, `convicted_count` + комментарии
- `punishments`: удалены устаревшие `punishment_type_id`, `description`, `date`, `fired_count`; добавлены агрегированные поля `guilty_persons_count`, `measures_taken_count`, `warning_letter_rp398`, `remark`, `reprimand`, `dismissed_count` + комментарии

### 011_rename_events_to_operational_activities.sql
Переименовывает таблицу `events` в `operational_activities` для соответствия новой терминологии.

### 012_rename_event_tables_to_incident_events.sql
Переименовывает таблицы событий инцидентов для избежания путаницы с будущей сущностью "события":
- `event_types` → `incident_event_types` (типы событий инцидентов)
- `event_history` → `incident_events` (события инцидентов)
- Обновляет все внешние ключи и комментарии

## 🚀 Как применить миграцию
## 📦 Деплой миграций на Production

**Рекомендуемый способ (автоматический):**

```bash
# 1. Перейдите в директорию проекта
cd ~/ims

# 2. Обновите код из репозитория
git pull

# 3. Пересоберите и перезапустите бэкенд
# Миграции применятся автоматически при старте!
docker-compose up -d --build ims-backend

# 4. Проверьте логи
docker logs -f ims-backend
```

### Альтернативный способ (ручное применение)

Если нужно применить миграции без перезапуска приложения:

```bash
# Применить миграции вручную
docker exec -it ims-backend npm run migrate:up

# Или применить конкретную миграцию через psql
docker exec -i ims-postgres psql -U admin -d ims < app/backend/migrations/001_add_new_incident_fields.sql
docker exec -i ims-postgres psql -U admin -d ims < app/backend/migrations/002_fix_criminal_and_punishment_tables.sql
docker exec -i ims-postgres psql -U admin -d ims < app/backend/migrations/003_align_criminal_punishment_with_models.sql

# Перезапустите бэкенд
docker-compose restart ims-backend
```

#### Вариант 2: Через копирование в контейнер

```bash
# Скопируйте файл миграции в контейнер
docker cp app/backend/migrations/001_add_new_incident_fields.sql ims-postgres:/tmp/migration.sql

# Примените миграцию
docker exec -i ims-postgres psql -U admin -d ims -f /tmp/migration.sql

# Перезапустите бэкенд
docker-compose restart ims-backend
```

#### Вариант 3: Интерактивная консоль psql

```bash
# Подключитесь к PostgreSQL
docker exec -it ims-postgres psql -U admin -d ims

# В консоли psql выполните команды миграции вручную
# Или загрузите файл:
\i /path/to/migration.sql
```

### Локально (Development)

```bash
# Миграции применяются автоматически при запуске
npm run dev

# Или применить вручную
npm run migrate:up
```

## ✅ Проверка применения миграций

### Проверить статус миграций

```bash
# В контейнере
docker exec -it ims-backend npm run migrate:status

# Локально
npm run migrate:status
```

### Проверить таблицы в БД

```bash
# Список всех таблиц
docker exec -it ims-postgres psql -U admin -d ims -c "\dt"

# Структура конкретной таблицы
docker exec -it ims-postgres psql -U admin -d ims -c "\d incidents"

# Проверить таблицу миграций
docker exec -it ims-postgres psql -U admin -d ims -c "SELECT * FROM migrations ORDER BY applied_at;"
```

## ⚠️ Важные замечания

1. **Автоматическое применение**: Миграции применяются автоматически при запуске приложения. Не нужно ничего делать вручную!

2. **Отслеживание**: Система отслеживает применённые миграции в таблице `migrations`. Каждая миграция применяется только один раз.

3. **Миграции идемпотентны**: Все миграции используют `IF NOT EXISTS` и `IF EXISTS`, поэтому их безопасно запускать повторно.

4. **Порядок выполнения**: Миграции автоматически применяются в порядке их номеров (001, 002, и т.д.).

5. **Production режим**: В продакшене используется `sequelize.sync({ alter: false })`, поэтому все изменения структуры БД должны применяться через миграции.

6. **Резервное копирование**: Перед применением миграций на production рекомендуется создать бэкап базы данных:
   ```bash
   docker exec ims-postgres pg_dump -U admin ims > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

7. **Откат миграции**: Если что-то пошло не так, восстановите из бэкапа:
   ```bash
   docker exec -i ims-postgres psql -U admin -d ims < backup_YYYYMMDD_HHMMSS.sql
   ```

## 🐛 Решение проблем

### Ошибка: "column does not exist"
Миграция не была применена. Проверьте статус миграций:
```bash
docker exec -it ims-backend npm run migrate:status
```

Если миграция не применилась автоматически, примените вручную:
```bash
docker exec -it ims-backend npm run migrate:up
```

### Ошибка: "out of shared memory" или "max_locks_per_transaction"
Не используйте `sequelize.sync({ alter: true })` в продакшене. Убедитесь, что в `index.ts` установлено `alter: false` для production.

### Ошибка: "relation already exists"
Это нормально, если миграция использует `IF NOT EXISTS`. Миграция пропустит создание существующих объектов.

### Миграция не применяется автоматически
1. Проверьте логи при запуске приложения:
   ```bash
   docker logs -f ims-backend
   ```
2. Убедитесь, что файл миграции находится в `migrations/` и имеет расширение `.sql`
3. Проверьте, что файл миграции имеет правильное имя (XXX_description.sql)
4. Попробуйте применить вручную: `npm run migrate:up`

### Посмотреть какие миграции были применены
```bash
docker exec -it ims-postgres psql -U admin -d ims -c "SELECT * FROM migrations ORDER BY applied_at;"
```

## 📝 Создание новой миграции

При добавлении новых полей или таблиц:

1. Создайте новый файл с номером `XXX_description.sql` в директории `migrations/`
2. Используйте `IF NOT EXISTS` для CREATE
3. Используйте `IF EXISTS` для DROP
4. Добавьте комментарии к новым полям
5. Обновите этот README с описанием миграции (в разделе "Список миграций")
6. Закоммитьте и запушьте изменения
7. **Миграция применится автоматически при следующем деплое!** 🎉

Пример структуры миграции:

```sql
-- Миграция: Описание изменений
-- Дата: YYYY-MM-DD

-- Добавление новых полей
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);

-- Создание новых таблиц
CREATE TABLE IF NOT EXISTS new_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

-- Удаление устаревших полей
ALTER TABLE table_name DROP COLUMN IF EXISTS old_field;

-- Комментарии
COMMENT ON COLUMN table_name.new_field IS 'Описание поля';
COMMENT ON TABLE new_table IS 'Описание таблицы';
```

## 📞 Поддержка

Если возникли проблемы с миграциями, проверьте:
1. Логи контейнера: `docker logs ims-backend`
2. Логи PostgreSQL: `docker logs ims-postgres`
3. Переменные окружения в `docker-compose.yaml`
4. Настройки подключения в `src/models/sequelize.ts`
