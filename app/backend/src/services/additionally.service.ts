import { Op, Transaction } from 'sequelize';
import Additionally, { 
  AdditionallyAttributes, 
  AdditionallyCreationAttributes,
  AdditionallyInstance 
} from '../models/additionally';
import Incident from '../models/incident';
import CriminalCase from '../models/criminalCase';
import Punishment from '../models/punishment';

export const additionallyService = {
  async getAdditionally(filters?: {
    incident_id?: number;
    date_from?: Date;
    date_to?: Date;
  }): Promise<AdditionallyInstance[]> {
    const where: any = {};
    
    if (filters?.incident_id) {
      where.incident_id = filters.incident_id;
    }
    if (filters?.date_from || filters?.date_to) {
      where.addition_date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    return await Additionally.findAll({
      where,
      include: [
        {
          model: Incident,
          as: 'incident',
          include: ['department', 'object_type']
        },
        {
          model: CriminalCase,
          as: 'criminal_case'
        },
        {
          model: Punishment,
          as: 'punishment'
        }
      ],
      order: [['addition_date', 'DESC']]
    });
  },

  async getAdditionallyById(id: number): Promise<AdditionallyInstance | null> {
    return await Additionally.findByPk(id, {
      include: [
        {
          model: Incident,
          as: 'incident',
          include: ['department', 'object_type']
        },
        {
          model: CriminalCase,
          as: 'criminal_case'
        },
        {
          model: Punishment,
          as: 'punishment'
        }
      ]
    });
  },

  async createAdditionally(
    data: AdditionallyCreationAttributes,
    options?: { transaction?: Transaction }
  ): Promise<AdditionallyInstance> {
    // Проверяем существование инцидента
    const incident = await Incident.findByPk(data.incident_id, options);
    if (!incident) {
      throw new Error('Incident not found');
    }

    return await Additionally.create(data, options);
  },

  async updateAdditionally(
    id: number,
    data: Partial<AdditionallyCreationAttributes>,
    options?: { transaction?: Transaction }
  ): Promise<AdditionallyInstance | null> {
    const additionally = await Additionally.findByPk(id);
    if (!additionally) return null;

    return await additionally.update(data, options);
  },

  async deleteAdditionally(
    id: number,
    options?: { transaction?: Transaction }
  ): Promise<boolean> {
    const additionally = await Additionally.findByPk(id);
    if (!additionally) return false;

    await additionally.destroy(options);
    return true;
  },

  // Вспомогательные методы
  async getAdditionallyByIncidentId(incidentId: number): Promise<AdditionallyInstance[]> {
    return await Additionally.findAll({
      where: { incident_id: incidentId },
      include: [
        {
          model: CriminalCase,
          as: 'criminal_case'
        },
        {
          model: Punishment,
          as: 'punishment'
        }
      ],
      order: [['addition_date', 'DESC']]
    });
  },

  async deleteAdditionallyByIncidentId(
    incidentId: number,
    options?: { transaction?: Transaction }
  ): Promise<boolean> {
    const result = await Additionally.destroy({
      where: { incident_id: incidentId },
      ...options
    });
    return result > 0;
  },

  async getAdditionallyStats(filters?: {
    date_from?: Date;
    date_to?: Date;
  }) {
    const where: any = {};
    
    if (filters?.date_from || filters?.date_to) {
      where.addition_date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    const additionally = await Additionally.findAll({ where });

    return {
      total: additionally.length,
      total_detected_damage: additionally.reduce((sum, a) => sum + (a.detected_damage || 0), 0),
      total_prevented_damage: additionally.reduce((sum, a) => sum + (a.prevented_damage || 0), 0),
      total_recovered_damage: additionally.reduce((sum, a) => sum + (a.recovered_damage || 0), 0),
    };
  }
};