import { ObjectType } from '../models';

export const objectTypeService = {
  async getAllObjectTypes() {
    return await ObjectType.findAll({
      order: [['title', 'ASC']],
    });
  },

  async getObjectTypeTree() {
    const objectTypes = await ObjectType.findAll({
      include: [
        {
          model: ObjectType,
          as: 'children',
          required: false,
        },
        {
          model: ObjectType,
          as: 'parent',
          required: false,
        },
      ],
      order: [['title', 'ASC']],
    });

    return objectTypes;
  },

  async getObjectType(id: number) {
    return await ObjectType.findByPk(id, {
      include: [
        {
          model: ObjectType,
          as: 'children',
          required: false,
        },
        {
          model: ObjectType,
          as: 'parent',
          required: false,
        },
      ],
    });
  },

  async createObjectType(data: { title: string; parent_id?: number }) {
    return await ObjectType.create(data);
  },

  async updateObjectType(id: number, data: { title: string }) {
    const objectType = await ObjectType.findByPk(id);
    if (!objectType) return null;

    await objectType.update(data);
    return objectType;
  },

  async deleteObjectType(id: number) {
    const objectType = await ObjectType.findByPk(id);
    if (!objectType) return null;

    await objectType.destroy();
    return true;
  },

  async getChildObjectTypes(parentId: number) {
    return await ObjectType.findAll({
      where: { parent_id: parentId },
      include: [
        {
          model: ObjectType,
          as: 'children',
          required: false,
        },
      ],
      order: [['title', 'ASC']],
    });
  },
};

