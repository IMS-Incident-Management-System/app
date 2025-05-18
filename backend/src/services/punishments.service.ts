import Punishments, { PunishmentsCreationAttributes } from '../models/punishments';

export const punishmentsService = {
  getPunishments: async () => {
    const punishments = await Punishments.findAll();
    return punishments;
  },

  getPunishmentsById: async (id: number) => {
    const punishments = await Punishments.findByPk(id);
    return punishments;
  },

  createPunishments: async (data: PunishmentsCreationAttributes) => {
    const punishments = await Punishments.create(data);
    return punishments;
  },

  updatePunishments: async (id: number, data: Partial<Punishments>) => {
    const punishments = await Punishments.findByPk(id);
    if (!punishments) throw new Error('Punishments not found');

    await punishments.update(data);
    return punishments;
  },

  deletePunishments: async (id: number) => {
    const punishments = await Punishments.findByPk(id);
    if (!punishments) throw new Error('Punishments not found');

    await punishments.destroy();
    return true;
  },
};