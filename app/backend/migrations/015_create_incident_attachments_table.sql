-- Миграция: Создание таблицы для вложений инцидентов
-- Дата: 2025-12-18
-- Описание: Создаем таблицу для хранения вложений (документов) к инцидентам

DO $$
BEGIN
  -- Создание таблицы incident_attachments только если таблица incidents существует
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    -- Создаем таблицу без внешнего ключа сначала
    CREATE TABLE IF NOT EXISTS incident_attachments (
      id SERIAL PRIMARY KEY,
      incident_id INTEGER NOT NULL,
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
      WHERE table_schema = 'public' AND constraint_name = 'incident_attachments_incident_id_fkey'
    ) THEN
      ALTER TABLE incident_attachments
      ADD CONSTRAINT incident_attachments_incident_id_fkey 
      FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE;
    END IF;

    -- Комментарии к таблице и колонкам
    EXECUTE 'COMMENT ON TABLE incident_attachments IS ''Вложения (документы) к инцидентам''';
    EXECUTE 'COMMENT ON COLUMN incident_attachments.id IS ''Уникальный идентификатор вложения''';
    EXECUTE 'COMMENT ON COLUMN incident_attachments.incident_id IS ''ID инцидента''';
    EXECUTE 'COMMENT ON COLUMN incident_attachments.filename IS ''Оригинальное имя файла''';
    EXECUTE 'COMMENT ON COLUMN incident_attachments.stored_filename IS ''Имя файла на диске''';
    EXECUTE 'COMMENT ON COLUMN incident_attachments.file_path IS ''Путь к файлу''';
    EXECUTE 'COMMENT ON COLUMN incident_attachments.file_size IS ''Размер файла в байтах''';
    EXECUTE 'COMMENT ON COLUMN incident_attachments.mime_type IS ''MIME тип файла''';

    -- Индекс для быстрого поиска вложений по инциденту
    CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident_id ON incident_attachments(incident_id);
  END IF;
END $$;


