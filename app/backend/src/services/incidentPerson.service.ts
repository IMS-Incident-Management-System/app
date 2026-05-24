import IncidentPerson, { IncidentPersonCreationAttributes } from '../models/incidentPerson';
import { Transaction } from 'sequelize';

class IncidentPersonService {
  async createPerson(data: IncidentPersonCreationAttributes, options?: { transaction?: Transaction }) {
    return await IncidentPerson.create(data, options);
  }

  async createPersons(persons: IncidentPersonCreationAttributes[], options?: { transaction?: Transaction }) {
    if (!persons || persons.length === 0) return [];
    return await IncidentPerson.bulkCreate(persons, options);
  }

  async getPersonsByIncidentId(incidentId: number) {
    return await IncidentPerson.findAll({
      where: { incident_id: incidentId },
    });
  }

  async deletePersonsByIncidentId(incidentId: number, options?: { transaction?: Transaction }) {
    return await IncidentPerson.destroy({
      where: { incident_id: incidentId },
      ...options,
    });
  }
}

export const incidentPersonService = new IncidentPersonService();

