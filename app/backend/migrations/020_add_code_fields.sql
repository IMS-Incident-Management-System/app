-- Миграция для добавления полей code в таблицы incidents, events, operational_activities
-- Создана: 2024

DO $$
BEGIN
  -- Добавляем поле code в таблицу incidents
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    ALTER TABLE incidents 
    ADD COLUMN IF NOT EXISTS code VARCHAR(20);

    -- Создаем уникальный индекс только если колонка существует
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'code') THEN
      -- Удаляем индекс если существует, чтобы пересоздать с UNIQUE
      DROP INDEX IF EXISTS idx_incidents_code;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_code_unique ON incidents(code) WHERE code IS NOT NULL;
      EXECUTE 'COMMENT ON COLUMN incidents.code IS ''Уникальный код инцидента (формат: IN-DDMMYYYY-HHmmss)''';
    END IF;
  END IF;

  -- Добавляем поле code в таблицу events
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE events 
    ADD COLUMN IF NOT EXISTS code VARCHAR(20);

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'code') THEN
      DROP INDEX IF EXISTS idx_events_code;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_events_code_unique ON events(code) WHERE code IS NOT NULL;
      EXECUTE 'COMMENT ON COLUMN events.code IS ''Уникальный код события (формат: EV-DDMMYYYY-HHmmss)''';
    END IF;
  END IF;

  -- Добавляем поле code в таблицу operational_activities
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'operational_activities') THEN
    ALTER TABLE operational_activities 
    ADD COLUMN IF NOT EXISTS code VARCHAR(20);

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'code') THEN
      DROP INDEX IF EXISTS idx_operational_activities_code;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_operational_activities_code_unique ON operational_activities(code) WHERE code IS NOT NULL;
      EXECUTE 'COMMENT ON COLUMN operational_activities.code IS ''Уникальный код операционной деятельности (формат: OA-DDMMYYYY-HHmmss)''';
    END IF;
  END IF;
END $$;

