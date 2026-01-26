-- Миграция для добавления поля employees_involved_count в таблицы punishments и event_punishments
-- Создана: 2024

DO $$
BEGIN
  -- Добавляем поле в таблицу punishments (для дополнений к инцидентам)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'punishments') THEN
    ALTER TABLE punishments
    ADD COLUMN IF NOT EXISTS employees_involved_count INTEGER;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'punishments' AND column_name = 'employees_involved_count') THEN
      EXECUTE 'COMMENT ON COLUMN punishments.employees_involved_count IS ''Установлено сотрудников, причастных к инциденту''';
    END IF;
  END IF;

  -- Добавляем поле в таблицу event_punishments (для событий)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_punishments') THEN
    ALTER TABLE event_punishments
    ADD COLUMN IF NOT EXISTS employees_involved_count INTEGER;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'event_punishments' AND column_name = 'employees_involved_count') THEN
      EXECUTE 'COMMENT ON COLUMN event_punishments.employees_involved_count IS ''Установлено сотрудников, причастных к инциденту''';
    END IF;
  END IF;
END $$;
