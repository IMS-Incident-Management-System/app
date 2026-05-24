-- Миграция: Создание таблицы для вложений к дополнениям инцидентов (incident events)
-- Дата: 2025-01-XX
-- Описание: Создаем таблицу для хранения вложений (документов) к дополнениям инцидентов

DO $$
BEGIN
  -- Создание таблицы incident_event_attachments только если таблица incident_events существует
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incident_events') THEN
    -- Создаем таблицу без внешнего ключа сначала
    CREATE TABLE IF NOT EXISTS incident_event_attachments (
      id SERIAL PRIMARY KEY,
      incident_event_id INTEGER NOT NULL,
      filename VARCHAR(255) NOT NULL,
      stored_filename VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Добавляем внешний ключ, если его еще нет
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'incident_event_attachments_incident_event_id_fkey'
    ) THEN
      ALTER TABLE incident_event_attachments
      ADD CONSTRAINT incident_event_attachments_incident_event_id_fkey 
      FOREIGN KEY (incident_event_id) REFERENCES incident_events(id) ON DELETE CASCADE;
    END IF;

    -- Комментарии к таблице и колонкам
    EXECUTE 'COMMENT ON TABLE incident_event_attachments IS ''Вложения (документы) к дополнениям инцидентов (incident events)''';
    EXECUTE 'COMMENT ON COLUMN incident_event_attachments.id IS ''Уникальный идентификатор вложения''';
    EXECUTE 'COMMENT ON COLUMN incident_event_attachments.incident_event_id IS ''ID дополнения инцидента (incident event)''';
    EXECUTE 'COMMENT ON COLUMN incident_event_attachments.filename IS ''Оригинальное имя файла''';
    EXECUTE 'COMMENT ON COLUMN incident_event_attachments.stored_filename IS ''Имя файла на диске''';
    EXECUTE 'COMMENT ON COLUMN incident_event_attachments.file_path IS ''Путь к файлу''';
    EXECUTE 'COMMENT ON COLUMN incident_event_attachments.file_size IS ''Размер файла в байтах''';
    EXECUTE 'COMMENT ON COLUMN incident_event_attachments.mime_type IS ''MIME тип файла''';

    -- Индекс для быстрого поиска вложений по дополнению инцидента
    CREATE INDEX IF NOT EXISTS idx_incident_event_attachments_incident_event_id ON incident_event_attachments(incident_event_id);
  END IF;
END $$;

