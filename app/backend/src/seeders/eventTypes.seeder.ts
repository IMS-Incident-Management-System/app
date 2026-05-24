import IncidentEventType, { IncidentEventTypeCreationAttributes } from '../models/incidentEventType';
import { transliterate } from '../utils/strings';

const ROOT_TYPES = [
  { title: 'Кражи', value: transliterate('Кражи').toLowerCase() },
  { title: 'Нападение на объект/сотрудников', value: transliterate('Нападение на объект/сотрудников').toLowerCase() },
  { title: 'Персонал', value: transliterate('Персонал').toLowerCase() },
  { title: 'Повреждения/Порча имущества', value: transliterate('Повреждения/Порча имущества').toLowerCase() },
  { title: 'Поджоги', value: transliterate('Поджоги').toLowerCase() },
  { title: 'Пожары/возгорания', value: transliterate('Пожары/возгорания').toLowerCase() },
  { title: 'Проникновение на объект', value: transliterate('Проникновение на объект').toLowerCase() },
  { title: 'Травма / Смертельный исход', value: transliterate('Травма / Смертельный исход').toLowerCase() },
  { title: 'БПЛА', value: transliterate('БПЛА').toLowerCase() },
];

const SUBTYPES: Record<string, string[]> = {
  Кражи: ['Не предотвращенный', 'Предотвращенные'],
  'Нападение на объект/сотрудников': ['Не предотвращенный', 'Предотвращенные'],
  Персонал: [],
  'Повреждения/Порча имущества': [],
  Поджоги: [],
  'Пожары/возгорания': [],
  'Проникновение на объект': ['Не предотвращенный', 'Предотвращенные'],
  'Травма / Смертельный исход': [],
  БПЛА: [],
};

export const seedEventTypes = async () => {
  const count = await IncidentEventType.count();

  if (count > 0) {
    // Таблица уже заполнена — добавляем отсутствующие корневые типы и подтипы (L2)
    const existingRoots = await IncidentEventType.findAll({
      where: { parent_id: null },
      attributes: ['event_type_id', 'title'],
    });
    const existingRootTitles = new Set(existingRoots.map((r) => r.title));
    const rootsToCreate = ROOT_TYPES.filter((r) => !existingRootTitles.has(r.title));
    if (rootsToCreate.length > 0) {
      await IncidentEventType.bulkCreate(rootsToCreate);
      console.log(`Incident event types: добавлено корневых: ${rootsToCreate.map((t) => t.title).join(', ')}`);
    }

    // Для каждого корневого типа, у которого должны быть подтипы, добавляем отсутствующие L2
    const allRoots = await IncidentEventType.findAll({
      where: { parent_id: null },
      attributes: ['event_type_id', 'title'],
    });
    for (const root of allRoots) {
      const subTitles = SUBTYPES[root.title];
      if (!subTitles?.length) continue;
      const existingChildren = await IncidentEventType.findAll({
        where: { parent_id: root.event_type_id },
        attributes: ['title'],
      });
      const existingChildTitles = new Set(existingChildren.map((c) => c.title));
      const childrenToCreate = subTitles
        .filter((t) => !existingChildTitles.has(t))
        .map((title) => ({
          title,
          parent_id: root.event_type_id,
          value: `${transliterate(root.title)}_${transliterate(title)}`.toLowerCase(),
        }));
      if (childrenToCreate.length > 0) {
        await IncidentEventType.bulkCreate(childrenToCreate);
        console.log(`Incident event types: для "${root.title}" добавлены подтипы: ${childrenToCreate.map((c) => c.title).join(', ')}`);
      }
    }
    return;
  }

  const createdRootTypes = await IncidentEventType.bulkCreate(ROOT_TYPES);

  for (const rootType of createdRootTypes) {
    const rootTitle = rootType.title;
    const subTitles = SUBTYPES[rootTitle];
    if (subTitles?.length > 0) {
      const subtypeData = subTitles.map((title) => ({
        title,
        parent_id: rootType.event_type_id,
        value: `${transliterate(rootTitle)}_${transliterate(title)}`.toLowerCase(),
      }));
      await IncidentEventType.bulkCreate(subtypeData);
    }
  }

  console.log('Incident event types seeded successfully');
};
