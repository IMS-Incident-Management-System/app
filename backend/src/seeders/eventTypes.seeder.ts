import { EEventType } from '../enums/eventTypes';
import EventType, { EventTypeCreationAttributes } from '../models/eventType';

export const seedEventTypes = async () => {
  const count = await EventType.count();
  if (count > 0) {
    console.log('Event types table already seeded');
    return;
  }

  const eventTypesSeed: EventTypeCreationAttributes[] = [
    { type: EEventType.THEFT, name: 'Кражи' },
    { type: EEventType.FIRE, name: 'Пожары/возгорания' },
    { type: EEventType.DAMAGE, name: 'Повреждения/Порча имущества' },
    { type: EEventType.PERSONNEL, name: 'Персонал' },
    { type: EEventType.UAV, name: 'БПЛА' },
    { type: EEventType.ARSON, name: 'Поджоги' }
  ];

  await EventType.bulkCreate(eventTypesSeed, { ignoreDuplicates: true });
  console.log('Event types seeded successfully');
};