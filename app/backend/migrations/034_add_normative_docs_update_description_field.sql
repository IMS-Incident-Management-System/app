-- Миграция для добавления поля normative_docs_update_description в таблицу operational_activities
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'operational_activities') THEN
    -- Добавляем новое поле для актуализации нормативной документации
    ALTER TABLE operational_activities
    ADD COLUMN IF NOT EXISTS normative_docs_update_description TEXT;

    -- Добавляем комментарий к новому полю
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'normative_docs_update_description') THEN
      EXECUTE 'COMMENT ON COLUMN operational_activities.normative_docs_update_description IS ''Актуализация нормативной и справочной документации по линии ИБ (текст)''';
    END IF;

    -- Обновляем комментарий к существующему полю
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'normative_docs_list') THEN
      EXECUTE 'COMMENT ON COLUMN operational_activities.normative_docs_list IS ''Перечень и статус пересмотренных и/или утвержденных нормативных документов по ИБ (текст)''';
    END IF;
  END IF;
END $$;
