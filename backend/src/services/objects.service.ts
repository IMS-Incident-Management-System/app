import Objects, { ObjectsCreationAttributes } from '../models/objects';

export const objectsService = {
  getObjects: async () => {
    const objects = await Objects.findAll();
    return objects;
  },

  getObjectsById: async (id: number) => {
    const objects = await Objects.findByPk(id);
    return objects;
  },

  createObjects: async (data: ObjectsCreationAttributes) => {
    const objects = await Objects.create(data);
    return objects;
  },

  updateObjects: async (id: number, data: Partial<Objects>) => {
    const objects = await Objects.findByPk(id);
    if (!objects) throw new Error('Objects not found');

    await objects.update(data);
    return objects;
  },

  deleteObjects: async (id: number) => {
    const objects = await Objects.findByPk(id);
    if (!objects) throw new Error('Objects not found');

    await objects.destroy();
    return true;
  },
};