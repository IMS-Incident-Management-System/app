import CriminalCase, { CriminalCaseCreationAttributes } from '../models/criminalCase';
import { Transaction } from 'sequelize';

class CriminalCaseService {
  async createCriminalCase(data: CriminalCaseCreationAttributes, options?: { transaction?: Transaction }) {
    return await CriminalCase.create(data, options);
  }

  async createCriminalCases(cases: CriminalCaseCreationAttributes[], options?: { transaction?: Transaction }) {
    if (!cases || cases.length === 0) return [];
    return await CriminalCase.bulkCreate(cases, options);
  }

  async getCriminalCasesByAdditionallyId(additionallyId: number) {
    return await CriminalCase.findAll({
      where: { additionally_id: additionallyId } as any,
    });
  }

  async deleteCriminalCasesByAdditionallyId(additionallyId: number, options?: { transaction?: Transaction }) {
    return await CriminalCase.destroy({
      where: { additionally_id: additionallyId } as any,
      ...options,
    });
  }
}

export const criminalCaseService = new CriminalCaseService();

