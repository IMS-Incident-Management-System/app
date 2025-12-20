-- Миграция для добавления поля entry_date (дата внесения) в таблицу operational_activities
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'operational_activities') THEN
    ALTER TABLE operational_activities
    ADD COLUMN IF NOT EXISTS entry_date DATE;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'entry_date') THEN
      EXECUTE 'COMMENT ON COLUMN operational_activities.entry_date IS ''Дата внесения операционной деятельности''';
    END IF;
  END IF;
END $$;

