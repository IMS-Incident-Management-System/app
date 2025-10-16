# Миграции базы данных

Этот каталог содержит SQL миграции для базы данных PostgreSQL.

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

## 🚀 Как применить миграцию

### На сервере (Production)

#### Вариант 1: Через docker exec (рекомендуется)

```bash
# Перейдите в директорию проекта
cd ~/ims

# Обновите код из репозитория
git pull

# Примените миграцию
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
# Если PostgreSQL запущен локально
psql -U admin -d ims -f migrations/001_add_new_incident_fields.sql

# Или через docker-compose в dev режиме
docker-compose exec postgres psql -U admin -d ims -f /migrations/001_add_new_incident_fields.sql
```

## ✅ Проверка применения миграции

После применения миграции проверьте, что все таблицы созданы:

```bash
docker exec -it ims-postgres psql -U admin -d ims -c "\dt"
```

Проверьте структуру таблицы incidents:

```bash
docker exec -it ims-postgres psql -U admin -d ims -c "\d incidents"
```

## ⚠️ Важные замечания

1. **Миграции идемпотентны**: Все миграции используют `IF NOT EXISTS` и `IF EXISTS`, поэтому их безопасно запускать повторно.

2. **Порядок выполнения**: Миграции должны применяться в порядке их номеров (001, 002, и т.д.).

3. **Production режим**: В продакшене используется `sequelize.sync({ alter: false })`, поэтому все изменения структуры БД должны применяться через миграции.

4. **Резервное копирование**: Перед применением миграций на production рекомендуется создать бэкап базы данных:
   ```bash
   docker exec ims-postgres pg_dump -U admin ims > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

5. **Откат миграции**: Если что-то пошло не так, восстановите из бэкапа:
   ```bash
   docker exec -i ims-postgres psql -U admin -d ims < backup_YYYYMMDD_HHMMSS.sql
   ```

## 🐛 Решение проблем

### Ошибка: "column does not exist"
Миграция не была применена. Примените соответствующую миграцию.

### Ошибка: "out of shared memory" или "max_locks_per_transaction"
Не используйте `sequelize.sync({ alter: true })` в продакшене. Убедитесь, что в `index.ts` установлено `alter: false` для production.

### Ошибка: "relation already exists"
Это нормально, если миграция использует `IF NOT EXISTS`. Миграция пропустит создание существующих объектов.

### Ошибка: "column 'additionally_id' does not exist"
Таблица была создана со старой структурой. Примените миграцию `002_fix_criminal_and_punishment_tables.sql`, которая пересоздаст таблицы.

## 📝 Создание новой миграции

При добавлении новых полей или таблиц:

1. Создайте новый файл с номером `XXX_description.sql`
2. Используйте `IF NOT EXISTS` для CREATE
3. Используйте `IF EXISTS` для DROP
4. Добавьте комментарии к новым полям
5. Обновите этот README с описанием миграции
6. Закоммитьте и запушьте изменения
7. Примените миграцию на сервере

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
