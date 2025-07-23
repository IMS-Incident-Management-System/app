import { Op, Transaction } from 'sequelize';
import CriminalCase, { 
  CriminalCaseAttributes, 
  CriminalCaseCreationAttributes,
  CriminalCaseInstance 
} from '../models/criminalCase';
import EventHistory from '../models/eventHistory';

export const criminalCaseService = {
  async getCriminalCases(filters?: {
    event_history_id?: number;
    transfer_date_from?: Date;
    transfer_date_to?: Date;
    department_name?: string;
  }): Promise<CriminalCaseInstance[]> {
    const where: any = {};
    
    if (filters?.event_history_id) {
      where.event_history_id = filters.event_history_id;
    }
    if (filters?.department_name) {
      where.department_name = { [Op.iLike]: `%${filters.department_name}%` };
    }
    if (filters?.transfer_date_from || filters?.transfer_date_to) {
      where.transfer_date = {
        [Op.between]: [
          filters.transfer_date_from || new Date(0),
          filters.transfer_date_to || new Date()
        ]
      };
    }

    return await CriminalCase.findAll({
      where,
      include: [{
        model: EventHistory,
        as: 'event',
        include: ['event_type', 'object']
      }],
      order: [['transfer_date', 'DESC']]
    });
  },

  async getCriminalCase(id: number): Promise<CriminalCaseInstance | null> {
    return await CriminalCase.findByPk(id, {
      include: [{
        model: EventHistory,
        as: 'event',
        include: ['event_type', 'object']
      }]
    });
  },

  async createCriminalCase(
    data: CriminalCaseCreationAttributes,
    options?: { transaction?: Transaction }
  ): Promise<CriminalCaseInstance> {
    // Проверяем существование события
    const event = await EventHistory.findByPk(data.event_history_id, options);
    if (!event) {
      throw new Error('Event not found');
    }

    return await CriminalCase.create(data, options);
  },

  async updateCriminalCase(
    id: number,
    data: Partial<CriminalCaseCreationAttributes>,
    options?: { transaction?: Transaction }
  ): Promise<CriminalCaseInstance | null> {
    const criminalCase = await CriminalCase.findByPk(id);
    if (!criminalCase) return null;

    return await criminalCase.update(data, options);
  },

  async deleteCriminalCase(
    id: number,
    options?: { transaction?: Transaction }
  ): Promise<boolean> {
    const criminalCase = await CriminalCase.findByPk(id);
    if (!criminalCase) return false;

    await criminalCase.destroy(options);
    return true;
  },

  // Вспомогательные методы
  async getCriminalCasesByEventId(eventId: number): Promise<CriminalCaseInstance[]> {
    return await CriminalCase.findAll({
      where: { event_history_id: eventId },
      order: [['transfer_date', 'DESC']]
    });
  },

  async getCriminalCaseStats(filters?: {
    date_from?: Date;
    date_to?: Date;
    department_name?: string;
  }) {
    const where: any = {};
    
    if (filters?.department_name) {
      where.department_name = { [Op.iLike]: `%${filters.department_name}%` };
    }
    if (filters?.date_from || filters?.date_to) {
      where.transfer_date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    const cases = await CriminalCase.findAll({ where });

    return {
      total: cases.length,
    };
  }
}; 