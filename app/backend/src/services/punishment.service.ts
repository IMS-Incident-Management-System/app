import { Op, Transaction } from 'sequelize';
import Punishment, { 
  PunishmentAttributes, 
  PunishmentCreationAttributes,
  PunishmentInstance 
} from '../models/punishment';
import Incident from '../models/incident';

export const punishmentService = {
  async getPunishments(filters?: {
    incident_id?: number;
    date_from?: Date;
    date_to?: Date;
  }): Promise<PunishmentInstance[]> {
    const where: any = {};
    
    if (filters?.incident_id) {
      where.incident_id = filters.incident_id;
    }
    if (filters?.date_from || filters?.date_to) {
      where.date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    return await Punishment.findAll({
      where,
      include: [{
        model: Incident,
        as: 'incident',
        include: ['department', 'object']
      }],
      order: [['date', 'DESC']]
    });
  },

  async getPunishment(id: number): Promise<PunishmentInstance | null> {
    return await Punishment.findByPk(id, {
      include: [{
        model: Incident,
        as: 'incident',
        include: ['department', 'object']
      }]
    });
  },

  async createPunishment(
    data: PunishmentCreationAttributes,
    options?: { transaction?: Transaction }
  ): Promise<PunishmentInstance> {
    // Проверяем существование инцидента
    const incident = await Incident.findByPk(data.incident_id, options);
    if (!incident) {
      throw new Error('Incident not found');
    }

    return await Punishment.create(data, options);
  },

  async updatePunishment(
    id: number,
    data: Partial<PunishmentCreationAttributes>,
    options?: { transaction?: Transaction }
  ): Promise<PunishmentInstance | null> {
    const punishment = await Punishment.findByPk(id);
    if (!punishment) return null;

    return await punishment.update(data, options);
  },

  async deletePunishment(
    id: number,
    options?: { transaction?: Transaction }
  ): Promise<boolean> {
    const punishment = await Punishment.findByPk(id);
    if (!punishment) return false;

    await punishment.destroy(options);
    return true;
  },

  // Вспомогательные методы
  async getPunishmentsByIncidentId(incidentId: number): Promise<PunishmentInstance[]> {
    return await Punishment.findAll({
      where: { incident_id: incidentId },
      order: [['date', 'DESC']]
    });
  },

  async getPunishmentStats(filters?: {
    date_from?: Date;
    date_to?: Date;
  }) {
    const where: any = {};
    
    if (filters?.date_from || filters?.date_to) {
      where.date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    const punishments = await Punishment.findAll({ where });

    return {
      total_fired: punishments.reduce((sum, p) => sum + p.fired_count, 0),
      total_punishments: punishments.length
    };
  }
}; 