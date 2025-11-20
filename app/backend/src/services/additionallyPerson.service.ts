import AdditionallyPerson, { AdditionallyPersonCreationAttributes } from '../models/additionallyPerson';
import { Transaction } from 'sequelize';

class AdditionallyPersonService {
  async createPerson(data: AdditionallyPersonCreationAttributes, options?: { transaction?: Transaction }) {
    return await AdditionallyPerson.create(data, options);
  }

  async createPersons(persons: AdditionallyPersonCreationAttributes[], options?: { transaction?: Transaction }) {
    if (!persons || persons.length === 0) return [];
    return await AdditionallyPerson.bulkCreate(persons, options);
  }

  async getPersonsByAdditionallyId(additionallyId: number) {
    return await AdditionallyPerson.findAll({
      where: { additionally_id: additionallyId },
    });
  }

  async deletePersonsByAdditionallyId(additionallyId: number, options?: { transaction?: Transaction }) {
    return await AdditionallyPerson.destroy({
      where: { additionally_id: additionallyId },
      ...options,
    });
  }
}

export const additionallyPersonService = new AdditionallyPersonService();

