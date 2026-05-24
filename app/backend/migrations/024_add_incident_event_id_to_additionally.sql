-- Миграция: Добавление поля incident_event_id в таблицу additionally
-- Дата: 2025-01-XX
-- Описание: Добавляем поле для связи дополнения с событием инцидента (для возможности прикрепления вложений)

DO $$
BEGIN
  -- Добавляем колонку incident_event_id, если ее еще нет
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'additionally' AND column_name = 'incident_event_id'
    ) THEN
      ALTER TABLE additionally
      ADD COLUMN incident_event_id INTEGER;

      -- Добавляем внешний ключ, если его еще нет
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' AND constraint_name = 'fk_additionally_incident_event'
      ) THEN
        ALTER TABLE additionally
        ADD CONSTRAINT fk_additionally_incident_event
        FOREIGN KEY (incident_event_id)
        REFERENCES incident_events(id)
        ON DELETE SET NULL;
      END IF;

      -- Добавляем комментарий
      EXECUTE 'COMMENT ON COLUMN additionally.incident_event_id IS ''ID события для прикрепления вложений''';
    END IF;
  END IF;
END $$;

