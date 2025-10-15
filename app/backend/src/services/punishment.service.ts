import Punishment, { PunishmentCreationAttributes } from '../models/punishment';
import { Transaction } from 'sequelize';

class PunishmentService {
  async createPunishment(data: PunishmentCreationAttributes, options?: { transaction?: Transaction }) {
    return await Punishment.create(data, options);
  }

  async getPunishmentByAdditionallyId(additionallyId: number) {
    return await Punishment.findOne({
      where: { additionally_id: additionallyId } as any,
    });
  }

  async updatePunishmentByAdditionallyId(additionallyId: number, data: Partial<PunishmentCreationAttributes>, options?: { transaction?: Transaction }) {
    const punishment = await Punishment.findOne({
      where: { additionally_id: additionallyId } as any,
    });
    
    if (punishment) {
      return await punishment.update(data, options);
    } else {
      // Проверяем, что обязательные поля присутствуют
      if (!data.date || !data.punishment_type_id) {
        throw new Error('Missing required fields: date and punishment_type_id are required');
      }
      return await Punishment.create({ 
        ...data, 
        additionally_id: additionallyId,
        date: data.date,
        punishment_type_id: data.punishment_type_id
      } as PunishmentCreationAttributes, options);
    }
  }

  async deletePunishmentByAdditionallyId(additionallyId: number, options?: { transaction?: Transaction }) {
    return await Punishment.destroy({
      where: { additionally_id: additionallyId } as any,
      ...options,
    });
  }
}

export const punishmentService = new PunishmentService();

