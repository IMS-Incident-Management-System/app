import { EEventType } from '../enums/eventTypes';
import EventType, {
  EventTypeCreationAttributes,
  EventTypeInstance 
} from '../models/eventType';

export const eventTypeService = {
  async getEventTypes(): Promise<EventTypeInstance[]> {
    return await EventType.findAll({
      order: [['type', 'ASC']]
    });
  },

  async getEventType(id: number): Promise<EventTypeInstance | null> {
    return await EventType.findByPk(id);
  },

  async getEventTypeByEnum(type: EEventType): Promise<EventTypeInstance | null> {
    return await EventType.findOne({
      where: { type }
    });
  },

  async createEventType(
    data: EventTypeCreationAttributes
  ): Promise<EventTypeInstance> {
    const existing = await EventType.findOne({
      where: { type: data.type }
    });
    
    if (existing) {
      throw new Error('Event type already exists');
    }

    return await EventType.create(data);
  },

  async updateEventType(
    id: number,
    data: Partial<EventTypeCreationAttributes>
  ): Promise<EventTypeInstance | null> {
    const eventType = await EventType.findByPk(id);
    if (!eventType) return null;

    if (data.type && data.type !== eventType.type) {
      const existing = await EventType.findOne({
        where: { type: data.type }
      });
      
      if (existing) {
        throw new Error('Event type already exists');
      }
    }

    return await eventType.update(data);
  },

  async deleteEventType(id: number): Promise<boolean> {
    const eventType = await EventType.findByPk(id);
    if (!eventType) return false;

    await eventType.destroy();
    return true;
  }
}; 