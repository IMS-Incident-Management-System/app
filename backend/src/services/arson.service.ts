import Arson, { ArsonCreationAttributes } from '../models/arson';

export const arsonService = {
  getArson: async () => {
    const arson = await Arson.findAll();
    return arson;
  },

  getArsonById: async (id: number) => {
    const arson = await Arson.findByPk(id);
    return arson;
  },

  createArson: async (data: ArsonCreationAttributes) => {
    const arson = await Arson.create(data);
    return arson;
  },

  updateArson: async (id: number, data: Partial<Arson>) => {
    const arson = await Arson.findByPk(id);
    if (!arson) throw new Error('Arson not found');

    await arson.update(data);
    return arson;
  },

  deleteArson: async (id: number) => {
    const arson = await Arson.findByPk(id);
    if (!arson) throw new Error('Arson not found');

    await arson.destroy();
    return true;
  },
};