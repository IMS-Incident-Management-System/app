import Damages, { DamagesCreationAttributes } from '../models/damages';

export const damagesService = {
  getDamages: async () => {
    const damages = await Damages.findAll();
    return damages;
  },

  getDamagesById: async (id: number) => {
    const damages = await Damages.findByPk(id);
    return damages;
  },

  createDamages: async (data: DamagesCreationAttributes) => {
    const damages = await Damages.create(data);
    return damages;
  },

  updateDamages: async (id: number, data: Partial<Damages>) => {
    const damages = await Damages.findByPk(id);
    if (!damages) throw new Error('Damages not found');

    await damages.update(data);
    return damages;
  },

  deleteDamages: async (id: number) => {
    const damages = await Damages.findByPk(id);
    if (!damages) throw new Error('Damages not found');

    await damages.destroy();
    return true;
  },
};