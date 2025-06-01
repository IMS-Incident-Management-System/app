import { Op } from 'sequelize';
import Object, {
  ObjectAttributes,
  ObjectCreationAttributes,
  ObjectInstance,
} from '../models/object';

export const objectService = {
  async getObjects(filters?: {
    type?: string;
    address?: string;
  }): Promise<ObjectInstance[]> {
    const where: any = {};

    if (filters?.type) {
      where.type = { [Op.iLike]: `%${filters.type}%` };
    }
    if (filters?.address) {
      where.address = { [Op.iLike]: `%${filters.address}%` };
    }

    return await Object.findAll({
      where,
      order: [['type', 'ASC']],
    });
  },

  async getObject(id: number): Promise<ObjectInstance | null> {
    return await Object.findByPk(id);
  },

  async createObject(data: ObjectCreationAttributes): Promise<ObjectInstance> {
    // Проверяем уникальность имени объекта
    const existing = await Object.findOne({
      where: { type: data.type },
    });

    if (existing) {
      throw new Error('Object with this name already exists');
    }

    return await Object.create(data);
  },

  async updateObject(
    id: number,
    data: Partial<ObjectCreationAttributes>
  ): Promise<ObjectInstance | null> {
    const object = await Object.findByPk(id);
    if (!object) return null;

    // Проверяем уникальность имени при изменении
    if (data.type && data.type !== object.type) {
      const existing = await Object.findOne({
        where: { type: data.type },
      });

      if (existing) {
        throw new Error('Object with this name already exists');
      }
    }

    return await object.update(data);
  },

  async deleteObject(id: number): Promise<boolean> {
    const object = await Object.findByPk(id);
    if (!object) return false;

    await object.destroy();
    return true;
  },

  // Вспомогательные методы
  async validateObject(id: number): Promise<boolean> {
    const object = await Object.findByPk(id);
    return !!object;
  },

  async searchObjects(query: string): Promise<ObjectInstance[]> {
    return await Object.findAll({
      where: {
        [Op.or]: [
          { type: { [Op.iLike]: `%${query}%` } },
          { address: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 10,
    });
  },
};
