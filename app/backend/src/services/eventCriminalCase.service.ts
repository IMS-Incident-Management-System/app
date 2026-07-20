import EventCriminalCase, { EventCriminalCaseCreationAttributes } from '../models/eventCriminalCase';
import { Transaction } from 'sequelize';
import { parseDateOnly } from '../utils/dateOnly';

function normalizeCriminalCaseDates(
  data: EventCriminalCaseCreationAttributes
): EventCriminalCaseCreationAttributes {
  return {
    ...data,
    transfer_date: parseDateOnly(data.transfer_date as unknown as string | Date | null | undefined),
    rejection_date: parseDateOnly(data.rejection_date as unknown as string | Date | null | undefined),
    appeal_date: parseDateOnly(data.appeal_date as unknown as string | Date | null | undefined),
    case_date: parseDateOnly(data.case_date as unknown as string | Date | null | undefined),
  };
}

class EventCriminalCaseService {
  async createEventCriminalCase(data: EventCriminalCaseCreationAttributes, options?: { transaction?: Transaction }) {
    return await EventCriminalCase.create(normalizeCriminalCaseDates(data), options);
  }

  async createEventCriminalCases(cases: EventCriminalCaseCreationAttributes[], options?: { transaction?: Transaction }) {
    if (!cases || cases.length === 0) return [];
    return await EventCriminalCase.bulkCreate(cases.map(normalizeCriminalCaseDates), options);
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

