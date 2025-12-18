import EventPunishment, { EventPunishmentCreationAttributes } from '../models/eventPunishment';
import { Transaction } from 'sequelize';

class EventPunishmentService {
  async createEventPunishment(data: EventPunishmentCreationAttributes, options?: { transaction?: Transaction }) {
    return await EventPunishment.create(data, options);
  }

  async getEventPunishmentByEventId(eventId: number) {
    return await EventPunishment.findOne({
      where: { event_id: eventId },
    });
  }

  async deleteEventPunishmentByEventId(eventId: number, options?: { transaction?: Transaction }) {
    return await EventPunishment.destroy({
      where: { event_id: eventId },
      ...options,
    });
  }
}

export const eventPunishmentService = new EventPunishmentService();

