import IncidentEventType, { IncidentEventTypeCreationAttributes } from '../models/incidentEventType';
import { transliterate } from '../utils/strings';

export const seedEventTypes = async () => {
  const count = await IncidentEventType.count();
  if (count > 0) {
    console.log('Incident event types table already seeded');
    return;
  }

  // Создаем корневые типы событий инцидентов
  const rootTypes = [
    { title: 'Кражи', value: transliterate('Кражи').toLowerCase() },
    { title: 'Нападение на объект/сотрудников', value: transliterate('Нападение на объект/сотрудников').toLowerCase() },
    { title: 'Персонал', value: transliterate('Персонал').toLowerCase() },
    { title: 'Повреждения/Порча имущества', value: transliterate('Повреждения/Порча имущества').toLowerCase() },
    { title: 'Поджоги', value: transliterate('Поджоги').toLowerCase() },
    { title: 'Пожары/возгорания', value: transliterate('Пожары/возгорания').toLowerCase() },
    { title: 'Проникновение на объект', value: transliterate('Проникновение на объект').toLowerCase() },
    { title: 'Травма / Смертельный исход', value: transliterate('Травма / Смертельный исход').toLowerCase() },
  ];

  const createdRootTypes = await IncidentEventType.bulkCreate(rootTypes);

  // Создаем подтипы для каждого корневого типа
  const subtypes = {
    Кражи: ['Предотвращенные', 'Не предотвращенный'],
    'Нападение на объект/сотрудников': ['Предотвращенные', 'Не предотвращенный'],
    Персонал: [],
    'Повреждения/Порча имущества': [],
    Поджоги: [],
    'Пожары/возгорания': [],
    'Проникновение на объект': ['Предотвращенные', 'Не предотвращенный'],
    'Травма / Смертельный исход': [],
  };

  // Создаем подтипы для каждого корневого типа
  for (const rootType of createdRootTypes) {
    const rootTitle = rootType.title;
    if (subtypes[rootTitle]) {
      const subtypeData = subtypes[rootTitle].map((title) => ({
        title,
        parent_id: rootType.event_type_id,
        value: `${transliterate(rootTitle)}_${transliterate(
          title
        )}`.toLowerCase(),
      }));
      await IncidentEventType.bulkCreate(subtypeData);
    }
  }

  console.log('Incident event types seeded successfully');
};
