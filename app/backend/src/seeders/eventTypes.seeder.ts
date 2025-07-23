import EventType, { EventTypeCreationAttributes } from '../models/eventType';
import { transliterate } from '../utils/strings';

export const seedEventTypes = async () => {
  const count = await EventType.count();
  if (count > 0) {
    console.log('Event types table already seeded');
    return;
  }

  // Создаем корневые типы событий
  const rootTypes = [
    { title: 'Кражи', value: transliterate('Кражи').toLowerCase() },
    { title: 'Пожары/возгорания', value: transliterate('Пожары/возгорания').toLowerCase() },
    { title: 'Повреждения/Порча имущества', value: transliterate('Повреждения/Порча имущества').toLowerCase() },
    { title: 'Персонал', value: transliterate('Персонал').toLowerCase() },
    { title: 'Поджоги', value: transliterate('Поджоги').toLowerCase() },
  ];

  const createdRootTypes = await EventType.bulkCreate(rootTypes);

  // Создаем подтипы для каждого корневого типа
  const subtypes = {
    Кражи: ['Кража кабеля', 'Кража АКБ', 'Кража оборудования'],
    'Пожары/возгорания': [],
    'Повреждения/Порча имущества': [],
    Персонал: [],
    БПЛА: [],
    Поджоги: [],
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
      await EventType.bulkCreate(subtypeData);
    }
  }

  console.log('Event types seeded successfully');
};
