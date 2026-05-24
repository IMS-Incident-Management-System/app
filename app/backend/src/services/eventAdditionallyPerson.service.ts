import EventAdditionallyPerson, { EventAdditionallyPersonCreationAttributes } from '../models/eventAdditionallyPerson';
import { Transaction } from 'sequelize';

class EventAdditionallyPersonService {
  async createPerson(data: EventAdditionallyPersonCreationAttributes, options?: { transaction?: Transaction }) {
    return await EventAdditionallyPerson.create(data, options);
  }

  async createPersons(persons: EventAdditionallyPersonCreationAttributes[], options?: { transaction?: Transaction }) {
    if (!persons || persons.length === 0) return [];
    return await EventAdditionallyPerson.bulkCreate(persons, options);
  }

  async getPersonsByEventAdditionallyId(eventAdditionallyId: number) {
    return await EventAdditionallyPerson.findAll({
      where: { event_additionally_id: eventAdditionallyId },
    });
  }

  async deletePersonsByEventAdditionallyId(eventAdditionallyId: number, options?: { transaction?: Transaction }) {
    return await EventAdditionallyPerson.destroy({
      where: { event_additionally_id: eventAdditionallyId },
      ...options,
    });
  }
}

export const eventAdditionallyPersonService = new EventAdditionallyPersonService();

