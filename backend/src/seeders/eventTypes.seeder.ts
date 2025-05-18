import EventType from '../models/eventType';

export const seedEventTypes = async () => {
  const count = await EventType.count();
  if (count > 0) {
    console.log('Event types table already seeded');
    return;
  }

  const eventTypes = [
    { name: 'Кражи' },
    { name: 'Пожары/возгорания' },
    { name: 'Повреждения/Порча имущества' },
    { name: 'Персонал' },
    { name: 'БПЛА' },
    { name: 'Поджоги' },
  ];

  await EventType.bulkCreate(eventTypes, { ignoreDuplicates: true });
  console.log('Event types seeded successfully');
};