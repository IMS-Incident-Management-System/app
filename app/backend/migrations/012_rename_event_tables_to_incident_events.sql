-- Миграция: Переименование таблиц event_types и event_history в incident_event_types и incident_events
-- Дата: 2025-12-04
-- Описание: Переименовываем таблицы событий инцидентов для избежания путаницы с будущей сущностью "события"

-- Переименовываем таблицу event_types в incident_event_types
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_types') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_event_types') THEN
        ALTER TABLE event_types RENAME TO incident_event_types;
        RAISE NOTICE 'Таблица event_types переименована в incident_event_types';
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_event_types') THEN
        RAISE NOTICE 'Таблица incident_event_types уже существует';
    ELSE
        RAISE NOTICE 'Таблица event_types не найдена';
    END IF;
END $$;

-- Переименовываем таблицу event_history в incident_events
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_history') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_events') THEN
        ALTER TABLE event_history RENAME TO incident_events;
        RAISE NOTICE 'Таблица event_history переименована в incident_events';
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_events') THEN
        RAISE NOTICE 'Таблица incident_events уже существует';
    ELSE
        RAISE NOTICE 'Таблица event_history не найдена';
    END IF;
END $$;

-- Обновляем внешние ключи в таблице incident_events
DO $$
DECLARE
    old_constraint_name TEXT;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_events') THEN
        -- Находим и удаляем старые внешние ключи, если они существуют
        -- Удаляем все возможные варианты имен старых внешних ключей
        FOR old_constraint_name IN 
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'incident_events' 
            AND constraint_type = 'FOREIGN KEY'
            AND (constraint_name LIKE '%event_type_id%' OR constraint_name LIKE '%event_history%')
        LOOP
            EXECUTE format('ALTER TABLE incident_events DROP CONSTRAINT IF EXISTS %I', old_constraint_name);
            RAISE NOTICE 'Удален старый внешний ключ: %', old_constraint_name;
        END LOOP;
        
        -- Создаем новый внешний ключ на incident_event_types
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'incident_events' 
            AND constraint_name = 'incident_events_event_type_id_fkey'
        ) THEN
            ALTER TABLE incident_events
            ADD CONSTRAINT incident_events_event_type_id_fkey 
            FOREIGN KEY (event_type_id) 
            REFERENCES incident_event_types(event_type_id) 
            ON DELETE SET NULL;
            
            RAISE NOTICE 'Создан новый внешний ключ event_type_id на incident_event_types';
        ELSE
            RAISE NOTICE 'Внешний ключ event_type_id уже существует';
        END IF;
    END IF;
END $$;

-- Обновляем самореференциальный внешний ключ в incident_event_types (parent_id)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_event_types') THEN
        -- Удаляем старый внешний ключ parent_id, если он существует
        ALTER TABLE incident_event_types 
        DROP CONSTRAINT IF EXISTS event_types_parent_id_fkey;
        
        -- Создаем новый внешний ключ
        ALTER TABLE incident_event_types
        ADD CONSTRAINT incident_event_types_parent_id_fkey 
        FOREIGN KEY (parent_id) 
        REFERENCES incident_event_types(event_type_id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Внешний ключ parent_id обновлен';
    END IF;
END $$;

-- Обновляем комментарии к таблицам
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_event_types') THEN
        COMMENT ON TABLE incident_event_types IS 'Типы событий инцидентов';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_events') THEN
        COMMENT ON TABLE incident_events IS 'События инцидентов';
    END IF;
END $$;

