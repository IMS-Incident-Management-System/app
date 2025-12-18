import { Op, Transaction } from 'sequelize';
import EventAdditionally, { 
  EventAdditionallyAttributes, 
  EventAdditionallyCreationAttributes,
  EventAdditionallyInstance 
} from '../models/eventAdditionally';
import Event from '../models/event';
import EventCriminalCase from '../models/eventCriminalCase';
import EventPunishment from '../models/eventPunishment';

export const eventAdditionallyService = {
  async getEventAdditionally(filters?: {
    event_id?: number;
    date_from?: Date;
    date_to?: Date;
  }): Promise<EventAdditionallyInstance[]> {
    const where: any = {};
    
    if (filters?.event_id) {
      where.event_id = filters.event_id;
    }
    if (filters?.date_from || filters?.date_to) {
      where.addition_date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    return await EventAdditionally.findAll({
      where,
      include: [
        {
          model: Event,
          as: 'event',
          include: ['department']
        },
        {
          model: EventCriminalCase,
          as: 'criminal_case'
        },
        {
          model: EventPunishment,
          as: 'punishment'
        }
      ],
      order: [['addition_date', 'DESC']]
    });
  },

  async getEventAdditionallyById(id: number): Promise<EventAdditionallyInstance | null> {
    return await EventAdditionally.findByPk(id, {
      include: [
        {
          model: Event,
          as: 'event',
          include: ['department']
        },
        {
          model: EventCriminalCase,
          as: 'criminal_case'
        },
        {
          model: EventPunishment,
          as: 'punishment'
        }
      ]
    });
  },

  async createEventAdditionally(
    data: EventAdditionallyCreationAttributes,
    options?: { transaction?: Transaction }
  ): Promise<EventAdditionallyInstance> {
    const event = await Event.findByPk(data.event_id, options);
    if (!event) {
      throw new Error('Event not found');
    }

    return await EventAdditionally.create(data, options);
  },

  async updateEventAdditionally(
    id: number,
    data: Partial<EventAdditionallyCreationAttributes>,
    options?: { transaction?: Transaction }
  ): Promise<EventAdditionallyInstance | null> {
    const eventAdditionally = await EventAdditionally.findByPk(id);
    if (!eventAdditionally) return null;

    return await eventAdditionally.update(data, options);
  },

  async deleteEventAdditionally(
    id: number,
    options?: { transaction?: Transaction }
  ): Promise<boolean> {
    const eventAdditionally = await EventAdditionally.findByPk(id);
    if (!eventAdditionally) return false;

    await eventAdditionally.destroy(options);
    return true;
  },

  async getEventAdditionallyByEventId(eventId: number): Promise<EventAdditionallyInstance[]> {
    return await EventAdditionally.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: EventCriminalCase,
          as: 'criminal_case'
        },
        {
          model: EventPunishment,
          as: 'punishment'
        }
      ],
      order: [['addition_date', 'DESC']]
    });
  },

  async deleteEventAdditionallyByEventId(
    eventId: number,
    options?: { transaction?: Transaction }
  ): Promise<boolean> {
    const result = await EventAdditionally.destroy({
      where: { event_id: eventId },
      ...options
    });
    return result > 0;
  },
};

