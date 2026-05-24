import EventCriminalCase, { EventCriminalCaseCreationAttributes } from '../models/eventCriminalCase';
import { Transaction } from 'sequelize';

class EventCriminalCaseService {
  async createEventCriminalCase(data: EventCriminalCaseCreationAttributes, options?: { transaction?: Transaction }) {
    return await EventCriminalCase.create(data, options);
  }

  async createEventCriminalCases(cases: EventCriminalCaseCreationAttributes[], options?: { transaction?: Transaction }) {
    if (!cases || cases.length === 0) return [];
    return await EventCriminalCase.bulkCreate(cases, options);
  }

  async getEventCriminalCaseByEventId(eventId: number) {
    return await EventCriminalCase.findOne({
      where: { event_id: eventId },
    });
  }

  async deleteEventCriminalCaseByEventId(eventId: number, options?: { transaction?: Transaction }) {
    return await EventCriminalCase.destroy({
      where: { event_id: eventId },
      ...options,
    });
  }
}

export const eventCriminalCaseService = new EventCriminalCaseService();

