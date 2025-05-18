import Fires, { FiresCreationAttributes } from '../models/fires';

export const firesService = {
  getFires: async () => {
    const fires = await Fires.findAll();
    return fires;
  },

  getFiresById: async (id: number) => {
    const fires = await Fires.findByPk(id);
    return fires;
  },

  createFires: async (data: FiresCreationAttributes) => {
    const fires = await Fires.create(data);
    return fires;
  },

  updateFires: async (id: number, data: Partial<Fires>) => {
    const fires = await Fires.findByPk(id);
    if (!fires) throw new Error('Fires not found');

    await fires.update(data);
    return fires;
  },

  deleteFires: async (id: number) => {
    const fires = await Fires.findByPk(id);
    if (!fires) throw new Error('Fires not found');

    await fires.destroy();
    return true;
  },
};