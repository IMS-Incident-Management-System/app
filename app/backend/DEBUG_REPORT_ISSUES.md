# Отладка проблем с отчетом

## Проблема 1: Почти все значения равны 0

### Возможные причины:

1. **Сидер не был запущен** - данные не созданы в базе
   - Решение: Запустите `make seed-report`

2. **Данные созданы, но не попадают в фильтр по датам**
   - Проверьте SQL запрос:
   ```sql
   SELECT COUNT(*), MIN("createdAt"), MAX("createdAt") 
   FROM incidents 
   WHERE "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01';
   ```
   
   ```sql
   SELECT COUNT(*), MIN("createdAt"), MAX("createdAt") 
   FROM events 
   WHERE "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01';
   ```

3. **Проблема с установкой createdAt через SQL**
   - Сидер использует параметризованные запросы: `$1, $2`
   - PostgreSQL может требовать другой синтаксис
   - Проверьте, правильно ли устанавливается дата

### Как проверить:

```sql
-- Проверка количества записей за 2023 год
SELECT 
  'incidents' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01' THEN 1 END) as in_2023
FROM incidents
UNION ALL
SELECT 
  'events' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01' THEN 1 END) as in_2023
FROM events
UNION ALL
SELECT 
  'operational_activities' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01' THEN 1 END) as in_2023
FROM operational_activities;
```

## Проблема 2: Дубликаты строк в подгруппах 2.4 и 2.7

### Причина:
В подгруппе 2.4 есть два поля:
- `available_vat` с label "Общая сумма доступного к возмещению, но не возмещенного НДС"
- `vat_deducted` с label "Принят к вычету НДС, руб."

Оба имеют одинаковый `subgroupName` "Общая сумма доступного к возмещению, но не возмещенного НДС".

Когда выводится строка подгруппы, она показывает название подгруппы, а потом выводятся детальные строки. Но для `available_vat` label совпадает с subgroupName, поэтому он не должен выводиться как детальная строка.

### Исправление:
Добавлена проверка: если `field.label === subgroupName` или `subgroupName` содержит `field.label` (для длинных названий), то детальная строка не выводится.

## Проблема 3: Только одно значение 420 261 в группе 1

Если видите только одно значение 420 261 в группе 1 и подгруппе 1.5, это означает:
- Либо данные не созданы (запустите сидер)
- Либо данные созданы, но не попадают в фильтр по датам
- Либо проблема с установкой createdAt

### Проверка:
```sql
-- Проверка суммы recovered_damage за 2023 год
SELECT 
  SUM(COALESCE(recovered_damage, 0)) as total_recovered_damage
FROM incidents
WHERE "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01'
UNION ALL
SELECT 
  SUM(COALESCE(recovered_damage, 0)) as total_recovered_damage
FROM events
WHERE "createdAt" >= '2023-01-01' AND "createdAt" < '2024-01-01';
```

Если сумма не равна 420 261, значит проблема с фильтрацией или данными.





