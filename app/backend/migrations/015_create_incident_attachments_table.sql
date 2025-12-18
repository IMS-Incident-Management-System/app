-- Миграция: Создание таблицы для вложений инцидентов
-- Дата: 2025-12-18
-- Описание: Создаем таблицу для хранения вложений (документов) к инцидентам

-- Создание таблицы incident_attachments
CREATE TABLE IF NOT EXISTS incident_attachments (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE incident_attachments IS 'Вложения (документы) к инцидентам';
COMMENT ON COLUMN incident_attachments.id IS 'Уникальный идентификатор вложения';
COMMENT ON COLUMN incident_attachments.incident_id IS 'ID инцидента';
COMMENT ON COLUMN incident_attachments.filename IS 'Оригинальное имя файла';
COMMENT ON COLUMN incident_attachments.stored_filename IS 'Имя файла на диске';
COMMENT ON COLUMN incident_attachments.file_path IS 'Путь к файлу';
COMMENT ON COLUMN incident_attachments.file_size IS 'Размер файла в байтах';
COMMENT ON COLUMN incident_attachments.mime_type IS 'MIME тип файла';

-- Индекс для быстрого поиска вложений по инциденту
CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident_id ON incident_attachments(incident_id);


