-- Создаем таблицу для связи many-to-many между инцидентами и типами объектов
CREATE TABLE IF NOT EXISTS incident_object_types (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL,
  object_type_id INTEGER NOT NULL,
  CONSTRAINT incident_object_types_incident_id_fkey 
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  CONSTRAINT incident_object_types_object_type_id_fkey 
    FOREIGN KEY (object_type_id) REFERENCES object_types(object_type_id) ON DELETE CASCADE,
  CONSTRAINT incident_object_type_unique UNIQUE (incident_id, object_type_id)
);

-- Комментарии для документации
COMMENT ON TABLE incident_object_types IS 'Таблица связи many-to-many между инцидентами и типами объектов';
COMMENT ON COLUMN incident_object_types.id IS 'ID записи';
COMMENT ON COLUMN incident_object_types.incident_id IS 'ID инцидента';
COMMENT ON COLUMN incident_object_types.object_type_id IS 'ID типа объекта';

-- Индекс для быстрого поиска по incident_id
CREATE INDEX IF NOT EXISTS idx_incident_object_types_incident_id ON incident_object_types(incident_id);

-- Индекс для быстрого поиска по object_type_id
CREATE INDEX IF NOT EXISTS idx_incident_object_types_object_type_id ON incident_object_types(object_type_id);

