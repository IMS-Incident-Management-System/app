-- Миграция для добавления полей code в таблицы incidents, events, operational_activities
-- Создана: 2024

-- Добавляем поле code в таблицу incidents
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

COMMENT ON COLUMN incidents.code IS 'Уникальный код инцидента (формат: IN-DDMMYYYY-HHmmss)';

-- Добавляем поле code в таблицу events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

COMMENT ON COLUMN events.code IS 'Уникальный код события (формат: EV-DDMMYYYY-HHmmss)';

-- Добавляем поле code в таблицу operational_activities
ALTER TABLE operational_activities 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

COMMENT ON COLUMN operational_activities.code IS 'Уникальный код операционной деятельности (формат: OA-DDMMYYYY-HHmmss)';

-- Создаем индексы для быстрого поиска по code
CREATE INDEX IF NOT EXISTS idx_incidents_code ON incidents(code);
CREATE INDEX IF NOT EXISTS idx_events_code ON events(code);
CREATE INDEX IF NOT EXISTS idx_operational_activities_code ON operational_activities(code);

