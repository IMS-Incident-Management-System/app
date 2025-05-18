import Uavs, { UavsCreationAttributes } from '../models/uavs';

export const uavsService = {
  getUavs: async () => {
    const uavs = await Uavs.findAll();
    return uavs;
  },

  getUavsById: async (id: number) => {
    const uavs = await Uavs.findByPk(id);
    return uavs;
  },

  createUavs: async (data: UavsCreationAttributes) => {
    const uavs = await Uavs.create(data);
    return uavs;
  },

  updateUavs: async (id: number, data: Partial<Uavs>) => {
    const uavs = await Uavs.findByPk(id);
    if (!uavs) throw new Error('Uavs not found');

    await uavs.update(data);
    return uavs;
  },

  deleteUavs: async (id: number) => {
    const uavs = await Uavs.findByPk(id);
    if (!uavs) throw new Error('Uavs not found');

    await uavs.destroy();
    return true;
  },
};