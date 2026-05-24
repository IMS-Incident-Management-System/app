-- Миграция для добавления поля outcome_type в таблицу incident_persons
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incident_persons') THEN
    ALTER TABLE incident_persons
    ADD COLUMN IF NOT EXISTS outcome_type VARCHAR(20);

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incident_persons' AND column_name = 'outcome_type') THEN
      EXECUTE 'COMMENT ON COLUMN incident_persons.outcome_type IS ''Тип исхода: injury - Травма, fatal - Смертельный исход''';
    END IF;
  END IF;
END $$;
