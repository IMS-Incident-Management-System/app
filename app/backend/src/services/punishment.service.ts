import Punishment, { PunishmentCreationAttributes } from '../models/punishment';
import { Transaction } from 'sequelize';

class PunishmentService {
  async createPunishment(data: PunishmentCreationAttributes, options?: { transaction?: Transaction }) {
    return await Punishment.create(data, options);
  }

  async createPunishments(punishments: PunishmentCreationAttributes[], options?: { transaction?: Transaction }) {
    if (!punishments || punishments.length === 0) return [];
    return await Punishment.bulkCreate(punishments, options);
  }

  async getPunishmentsByAdditionallyId(additionallyId: number) {
    return await Punishment.findAll({
      where: { additionally_id: additionallyId },
    });
  }

  async deletePunishmentsByAdditionallyId(additionallyId: number, options?: { transaction?: Transaction }) {
    return await Punishment.destroy({
      where: { additionally_id: additionallyId },
      ...options,
    });
  }
}

export const punishmentService = new PunishmentService();

