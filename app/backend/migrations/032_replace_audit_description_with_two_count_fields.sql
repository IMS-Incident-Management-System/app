-- Миграция для замены поля audit_description на два числовых поля
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'operational_activities') THEN
    -- Добавляем новые поля
    ALTER TABLE operational_activities
    ADD COLUMN IF NOT EXISTS audit_security_control_count INTEGER,
    ADD COLUMN IF NOT EXISTS work_status_result_count INTEGER;

    -- Добавляем комментарии к новым полям
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'audit_security_control_count') THEN
      EXECUTE 'COMMENT ON COLUMN operational_activities.audit_security_control_count IS ''Проведение аудита и контроль защищённости информационной инфраструктуры ИС (кол-во)''';
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'work_status_result_count') THEN
      EXECUTE 'COMMENT ON COLUMN operational_activities.work_status_result_count IS ''Описание статуса и/или результата проводимых работ в рамках данной задачи (кол-во)''';
    END IF;

    -- Удаляем старое текстовое поле (опционально, можно оставить для миграции данных)
    -- ALTER TABLE operational_activities DROP COLUMN IF EXISTS audit_description;
  END IF;
END $$;
