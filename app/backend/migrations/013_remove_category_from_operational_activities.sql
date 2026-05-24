-- Миграция: Удаление поля category из таблицы operational_activities
-- Дата: 2025-12-08
-- Описание: Удаляем поле category, так как оно больше не используется

-- Удаляем колонку category
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_name = 'operational_activities' 
               AND column_name = 'category') THEN
        ALTER TABLE operational_activities 
        DROP COLUMN category;
        
        RAISE NOTICE 'Колонка category удалена из таблицы operational_activities';
    ELSE
        RAISE NOTICE 'Колонка category не найдена в таблице operational_activities';
    END IF;
END $$;

