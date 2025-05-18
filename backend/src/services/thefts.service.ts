import Thefts, { TheftsCreationAttributes } from '../models/thefts';

export const theftsService = {
  getThefts: async () => {
    const thefts = await Thefts.findAll();
    return thefts;
  },

  getTheftsById: async (id: number) => {
    const thefts = await Thefts.findByPk(id);
    return thefts;
  },

  createThefts: async (data: TheftsCreationAttributes) => {
    const thefts = await Thefts.create(data);
    return thefts;
  },

  updateThefts: async (id: number, data: Partial<Thefts>) => {
    const thefts = await Thefts.findByPk(id);
    if (!thefts) throw new Error('Thefts not found');

    await thefts.update(data);
    return thefts;
  },

  deleteThefts: async (id: number) => {
    const thefts = await Thefts.findByPk(id);
    if (!thefts) throw new Error('Thefts not found');

    await thefts.destroy();
    return true;
  },
};