-- Создаем таблицу для связи many-to-many между инцидентами и типами объектов
CREATE TABLE IF NOT EXISTS incident_object_types (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER, -- Сделано nullable, FK будет добавлен условно
  object_type_id INTEGER, -- Сделано nullable, FK будет добавлен условно
  CONSTRAINT incident_object_type_unique UNIQUE (incident_id, object_type_id)
);

-- Добавляем внешние ключи только если таблицы существуют
DO $$
BEGIN
  -- Проверяем существование таблицы incidents и добавляем внешний ключ
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'incident_object_types_incident_id_fkey'
    ) THEN
      ALTER TABLE incident_object_types 
      ADD CONSTRAINT incident_object_types_incident_id_fkey 
      FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE;
    END IF;
    -- Добавляем NOT NULL, если таблица incidents существует и столбец incident_id nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incident_object_types' AND column_name = 'incident_id' AND is_nullable = 'YES') THEN
      EXECUTE 'ALTER TABLE incident_object_types ALTER COLUMN incident_id SET NOT NULL';
    END IF;
  END IF;

  -- Проверяем существование таблицы object_types и добавляем внешний ключ
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'object_types') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'incident_object_types_object_type_id_fkey'
    ) THEN
      ALTER TABLE incident_object_types 
      ADD CONSTRAINT incident_object_types_object_type_id_fkey 
      FOREIGN KEY (object_type_id) REFERENCES object_types(object_type_id) ON DELETE CASCADE;
    END IF;
    -- Добавляем NOT NULL, если таблица object_types существует и столбец object_type_id nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incident_object_types' AND column_name = 'object_type_id' AND is_nullable = 'YES') THEN
      EXECUTE 'ALTER TABLE incident_object_types ALTER COLUMN object_type_id SET NOT NULL';
    END IF;
  END IF;
END $$;

-- Комментарии для документации
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incident_object_types') THEN
    EXECUTE 'COMMENT ON TABLE incident_object_types IS ''Таблица связи many-to-many между инцидентами и типами объектов''';
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incident_object_types' AND column_name = 'id') THEN
      EXECUTE 'COMMENT ON COLUMN incident_object_types.id IS ''ID записи''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incident_object_types' AND column_name = 'incident_id') THEN
      EXECUTE 'COMMENT ON COLUMN incident_object_types.incident_id IS ''ID инцидента''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incident_object_types' AND column_name = 'object_type_id') THEN
      EXECUTE 'COMMENT ON COLUMN incident_object_types.object_type_id IS ''ID типа объекта''';
    END IF;
  END IF;
END $$;

-- Индекс для быстрого поиска по incident_id
CREATE INDEX IF NOT EXISTS idx_incident_object_types_incident_id ON incident_object_types(incident_id);

-- Индекс для быстрого поиска по object_type_id
CREATE INDEX IF NOT EXISTS idx_incident_object_types_object_type_id ON incident_object_types(object_type_id);

