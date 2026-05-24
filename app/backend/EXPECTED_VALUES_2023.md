# Ожидаемые значения в Excel отчете за 2023 год

## Как проверить точные значения

Данные в сидере распределяются **случайно** по годам 2023, 2024, 2025, поэтому точные значения предсказать нельзя. Но можно проверить их через SQL запросы.

## SQL запросы для проверки значений за 2023 год

### 1. Проверка количества событий (булевы поля)

```sql
-- is_service_investigation = true (должно быть ~10 из 30, так как 1/3 за 2023)
SELECT 
  department_id,
  COUNT(*) as count
FROM events 
WHERE is_service_investigation = true 
  AND "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- is_service_check = true (должно быть ~8-9 из 25)
SELECT 
  department_id,
  COUNT(*) as count
FROM events 
WHERE is_service_check = true 
  AND "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- is_service_check_ib = true (должно быть ~7 из 20)
SELECT 
  department_id,
  COUNT(*) as count
FROM events 
WHERE is_service_check_ib = true 
  AND "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- is_verification_activity = true (должно быть ~12 из 35)
SELECT 
  department_id,
  COUNT(*) as count
FROM events 
WHERE is_verification_activity = true 
  AND "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;
```

### 2. Проверка сумм финансовых полей Event

```sql
-- detected_damage из events
SELECT 
  department_id,
  SUM(COALESCE(detected_damage, 0)) as total
FROM events
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- recovered_damage из events
SELECT 
  department_id,
  SUM(COALESCE(recovered_damage, 0)) as total
FROM events
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- prevented_damage из events
SELECT 
  department_id,
  SUM(COALESCE(prevented_damage, 0)) as total
FROM events
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- additional_income из events
SELECT 
  department_id,
  SUM(COALESCE(additional_income, 0)) as total
FROM events
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- prevented_unnecessary_writeoff из events
SELECT 
  department_id,
  SUM(COALESCE(prevented_unnecessary_writeoff, 0)) as total
FROM events
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- vat_deducted из events
SELECT 
  department_id,
  SUM(COALESCE(vat_deducted, 0)) as total
FROM events
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;
```

### 3. Проверка сумм финансовых полей Incident

```sql
-- detected_damage из incidents
SELECT 
  department_id,
  SUM(COALESCE(detected_damage, 0)) as total
FROM incidents
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- recovered_damage из incidents
SELECT 
  department_id,
  SUM(COALESCE(recovered_damage, 0)) as total
FROM incidents
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- prevented_damage из incidents
SELECT 
  department_id,
  SUM(COALESCE(prevented_damage, 0)) as total
FROM incidents
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- additional_income из incidents
SELECT 
  department_id,
  SUM(COALESCE(additional_income, 0)) as total
FROM incidents
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- reduced_cost из incidents
SELECT 
  department_id,
  SUM(COALESCE(reduced_cost, 0)) as total
FROM incidents
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;
```

### 4. Проверка сумм полей OperationalActivity (группа 2)

```sql
-- total_debt (должно быть ~13-14 из 40 записей за 2023)
SELECT 
  department_id,
  SUM(COALESCE(total_debt, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- overdue_debt
SELECT 
  department_id,
  SUM(COALESCE(overdue_debt, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- overdue_debt_sb
SELECT 
  department_id,
  SUM(COALESCE(overdue_debt_sb, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- recovered_debt
SELECT 
  department_id,
  SUM(COALESCE(recovered_debt, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- available_vat
SELECT 
  department_id,
  SUM(COALESCE(available_vat, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- vat_assistance
SELECT 
  department_id,
  SUM(COALESCE(vat_assistance, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- written_off_debt
SELECT 
  department_id,
  SUM(COALESCE(written_off_debt, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- prevented_writeoff
SELECT 
  department_id,
  SUM(COALESCE(prevented_writeoff, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;
```

### 5. Проверка сумм полей OperationalActivity (группа 3)

```sql
-- checked_entities_new (должно быть ~12 из 35 записей за 2023)
SELECT 
  department_id,
  SUM(COALESCE(checked_entities_new, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- negative_conclusions_new
SELECT 
  department_id,
  SUM(COALESCE(negative_conclusions_new, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- checked_entities_active
SELECT 
  department_id,
  SUM(COALESCE(checked_entities_active, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- negative_conclusions_active
SELECT 
  department_id,
  SUM(COALESCE(negative_conclusions_active, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- checked_draft_contracts
SELECT 
  department_id,
  SUM(COALESCE(checked_draft_contracts, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- not_approved_drafts
SELECT 
  department_id,
  SUM(COALESCE(not_approved_drafts, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;

-- checked_active_contracts
SELECT 
  department_id,
  SUM(COALESCE(checked_active_contracts, 0)) as total
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' 
  AND "createdAt" < '2024-01-01'
GROUP BY department_id
ORDER BY department_id;
```

## Общий запрос для проверки всех значений по департаментам

```sql
-- Общая статистика за 2023 год
SELECT 
  'Events' as entity_type,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_service_investigation = true THEN 1 END) as is_service_investigation_count,
  COUNT(CASE WHEN is_service_check = true THEN 1 END) as is_service_check_count,
  COUNT(CASE WHEN is_service_check_ib = true THEN 1 END) as is_service_check_ib_count,
  COUNT(CASE WHEN is_verification_activity = true THEN 1 END) as is_verification_activity_count,
  SUM(COALESCE(detected_damage, 0)) as detected_damage_sum,
  SUM(COALESCE(recovered_damage, 0)) as recovered_damage_sum,
  SUM(COALESCE(prevented_damage, 0)) as prevented_damage_sum,
  SUM(COALESCE(additional_income, 0)) as additional_income_sum,
  SUM(COALESCE(prevented_unnecessary_writeoff, 0)) as prevented_unnecessary_writeoff_sum,
  SUM(COALESCE(vat_deducted, 0)) as vat_deducted_sum
FROM events
WHERE "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01'

UNION ALL

SELECT 
  'Incidents' as entity_type,
  COUNT(*) as total_records,
  0 as is_service_investigation_count,
  0 as is_service_check_count,
  0 as is_service_check_ib_count,
  0 as is_verification_activity_count,
  SUM(COALESCE(detected_damage, 0)) as detected_damage_sum,
  SUM(COALESCE(recovered_damage, 0)) as recovered_damage_sum,
  SUM(COALESCE(prevented_damage, 0)) as prevented_damage_sum,
  SUM(COALESCE(additional_income, 0)) as additional_income_sum,
  0 as prevented_unnecessary_writeoff_sum,
  0 as vat_deducted_sum
FROM incidents
WHERE "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01'

UNION ALL

SELECT 
  'OperationalActivities' as entity_type,
  COUNT(*) as total_records,
  0 as is_service_investigation_count,
  0 as is_service_check_count,
  0 as is_service_check_ib_count,
  0 as is_verification_activity_count,
  0 as detected_damage_sum,
  0 as recovered_damage_sum,
  0 as prevented_damage_sum,
  0 as additional_income_sum,
  0 as prevented_unnecessary_writeoff_sum,
  0 as vat_deducted_sum
FROM operational_activities
WHERE "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01';
```

## Примерные ожидаемые значения (приблизительно 1/3 от общего количества)

Так как данные распределяются случайно по 3 годам, примерно **1/3 данных** будет за 2023 год:

### События (Event)
- **is_service_investigation**: ~10 из 30 (примерно 33%)
- **is_service_check**: ~8-9 из 25 (примерно 33%)
- **is_service_check_ib**: ~7 из 20 (примерно 33%)
- **is_verification_activity**: ~12 из 35 (примерно 33%)
- **Всего событий**: ~53 из 160 (примерно 33%)

### Инциденты (Incident)
- **Всего инцидентов**: ~67 из 200 (примерно 33%)

### Операционная деятельность (OperationalActivity)
- **DEBT_RECOVERY**: ~13-14 из 40 (примерно 33%)
- **INVESTMENT_CONTROL**: ~12 из 35 (примерно 33%)
- **Всего**: ~25 из 75 (примерно 33%)

## Как проверить в Excel

1. Сгенерируйте отчет за период `2023-01-01` до `2023-12-31`
2. Выберите все департаменты
3. Выберите все поля
4. Сравните значения в Excel с результатами SQL запросов выше

**Важно:** Точные значения будут разными при каждом запуске сидера, так как данные распределяются случайно. Используйте SQL запросы для проверки правильности сумм.





