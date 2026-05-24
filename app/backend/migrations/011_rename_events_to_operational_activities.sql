-- Миграция: Переименование таблицы events в operational_activities
-- Дата: 2025-12-04
-- Описание: Переименовываем таблицу events в operational_activities для соответствия новой терминологии

-- Обрабатываем переименование таблицы
DO $$
BEGIN
    -- Если events существует, а operational_activities нет - переименовываем
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'operational_activities') THEN
        ALTER TABLE events RENAME TO operational_activities;
        RAISE NOTICE 'Таблица events переименована в operational_activities';
    -- Если обе таблицы существуют - просто удаляем events (operational_activities уже создана Sequelize)
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events')
          AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'operational_activities') THEN
        -- Удаляем старую таблицу events (данные уже должны быть в operational_activities или будут созданы заново)
        DROP TABLE IF EXISTS events;
        RAISE NOTICE 'Таблица events удалена, operational_activities уже существует';
    -- Если только operational_activities существует - ничего не делаем
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'operational_activities') THEN
        RAISE NOTICE 'Таблица operational_activities уже существует, переименование не требуется';
    -- Если ни одна таблица не существует - ничего не делаем
    ELSE
        RAISE NOTICE 'Таблица events не найдена, будет создана при синхронизации моделей';
    END IF;
END $$;

-- Обновляем комментарии к таблице (только если таблица существует)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'operational_activities') THEN
        COMMENT ON TABLE operational_activities IS 'Операционная деятельность';
        
        -- Обновляем комментарии к полям, если они существуют
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'operational_activities' AND column_name = 'created_by') THEN
            COMMENT ON COLUMN operational_activities.created_by IS 'ID пользователя, создавшего операционную деятельность (из Keycloak)';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'operational_activities' AND column_name = 'category') THEN
            COMMENT ON COLUMN operational_activities.category IS 'Категория операционной деятельности';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'operational_activities' AND column_name = 'description') THEN
            COMMENT ON COLUMN operational_activities.description IS 'Описание операционной деятельности';
        END IF;
    END IF;
END $$;
