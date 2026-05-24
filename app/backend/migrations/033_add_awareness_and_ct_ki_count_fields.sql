-- Миграция для добавления полей awareness_count и ct_ki_protection_count в таблицу operational_activities
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'operational_activities') THEN
    -- Добавляем поле для Повышение осведомленности
    ALTER TABLE operational_activities
    ADD COLUMN IF NOT EXISTS awareness_count INTEGER;

    -- Добавляем поле для Реализация режима защиты КТ и КИ
    ALTER TABLE operational_activities
    ADD COLUMN IF NOT EXISTS ct_ki_protection_count INTEGER;

    -- Добавляем комментарии к новым полям
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'awareness_count') THEN
      EXECUTE 'COMMENT ON COLUMN operational_activities.awareness_count IS ''Повышение осведомленности в области ИБ сотрудников компании (кол-во)''';
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'ct_ki_protection_count') THEN
      EXECUTE 'COMMENT ON COLUMN operational_activities.ct_ki_protection_count IS ''Реализация режима защиты КТ и КИ (кол-во)''';
    END IF;
  END IF;
END $$;
