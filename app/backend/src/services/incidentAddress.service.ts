import IncidentAddress, { IncidentAddressCreationAttributes } from '../models/incidentAddress';
import { Transaction } from 'sequelize';

class IncidentAddressService {
  async createAddress(data: IncidentAddressCreationAttributes, options?: { transaction?: Transaction }) {
    return await IncidentAddress.create(data, options);
  }

  async createAddresses(addresses: IncidentAddressCreationAttributes[], options?: { transaction?: Transaction }) {
    if (!addresses || addresses.length === 0) return [];
    return await IncidentAddress.bulkCreate(addresses, options);
  }

  async getAddressesByIncidentId(incidentId: number) {
    return await IncidentAddress.findAll({
      where: { incident_id: incidentId },
    });
  }

  async deleteAddressesByIncidentId(incidentId: number, options?: { transaction?: Transaction }) {
    return await IncidentAddress.destroy({
      where: { incident_id: incidentId },
      ...options,
    });
  }
}

export const incidentAddressService = new IncidentAddressService();

