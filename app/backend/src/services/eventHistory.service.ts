import { Op, Transaction } from 'sequelize';
import EventHistory, { 
  EventHistoryAttributes, 
  EventHistoryCreationAttributes,
  EventHistoryInstance 
} from '../models/eventHistory';
import EventType from '../models/eventType';

export const eventHistoryService = {
  async getEvents(filters?: {
    incident_id?: number;
    event_type_id?: number;
    object_id?: number;
    date_from?: Date;
    date_to?: Date;
  }): Promise<EventHistoryInstance[]> {
    const where: any = {};
    
    if (filters?.incident_id) {
      where.incident_id = filters.incident_id;
    }
    if (filters?.event_type_id) {
      where.event_type_id = filters.event_type_id;
    }
    if (filters?.object_id) {
      where.object_id = filters.object_id;
    }
    if (filters?.date_from || filters?.date_to) {
      where.date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    return await EventHistory.findAll({
      where,
      include: [
        {
          model: EventType,
          as: 'event_type'
        }
      ],
      order: [['date', 'DESC']]
    });
  },

  async getEvent(id: number): Promise<EventHistoryInstance | null> {
    return await EventHistory.findByPk(id, {
      include: [
        'event_type'
      ]
    });
  },

  async createEvent(
    data: EventHistoryCreationAttributes,
    options?: { transaction?: Transaction }
  ): Promise<EventHistoryInstance> {
    return await EventHistory.create(data, options);
  },

  async updateEvent(
    id: number,
    data: Partial<EventHistoryCreationAttributes>,
    options?: { transaction?: Transaction }
  ): Promise<EventHistoryInstance | null> {
    const event = await EventHistory.findByPk(id);
    if (!event) return null;

    return await event.update(data, options);
  },

  async deleteEvent(
    id: number,
    options?: { transaction?: Transaction }
  ): Promise<boolean> {
    const event = await EventHistory.findByPk(id);
    if (!event) return false;

    await event.destroy(options);
    return true;
  },

  async deleteEventsByIncidentId(
    incidentId: number,
    options?: { transaction?: Transaction }
  ): Promise<number> {
    const deletedCount = await EventHistory.destroy({
      where: { incident_id: incidentId },
      ...options
    });
    return deletedCount;
  },

}; 