-- Добавляем поле apartment в таблицу incident_addresses
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incident_addresses') THEN
    -- Добавляем колонку apartment, если её еще нет
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'incident_addresses' AND column_name = 'apartment'
    ) THEN
      ALTER TABLE incident_addresses 
      ADD COLUMN apartment VARCHAR(255);
      
      COMMENT ON COLUMN incident_addresses.apartment IS 'Квартира';
    END IF;
  END IF;
END $$;

