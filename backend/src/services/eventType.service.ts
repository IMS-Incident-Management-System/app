import EventType, { EventTypeCreationAttributes } from '../models/eventType';

export const eventTypeService = {
  getEventTypes: async () => {
    const eventTypes = await EventType.findAll();
    return eventTypes;
  },

  getEventType: async (id: number) => {
    const eventType = await EventType.findByPk(id);
    return eventType;
  },

  createEventType: async (data: EventTypeCreationAttributes) => {
    const eventType = await EventType.create(data);
    return eventType;
  },

  updateEventType: async (id: number, data: Partial<EventType>) => {
    const eventType = await EventType.findByPk(id);
    if (!eventType) throw new Error('Event type not found');

    await eventType.update(data);
    return eventType;
  },

  deleteEventType: async (id: number) => {
    const eventType = await EventType.findByPk(id);
    if (!eventType) throw new Error('Event type not found');

    await eventType.destroy();
    return true;
  },
};