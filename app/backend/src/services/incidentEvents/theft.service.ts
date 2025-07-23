import { TheftTypeEnum } from "../../enums/theft";
import TheftType, { TheftTypeCreationAttributes, TheftTypeInstance } from "../../models/incidentEvents/theft";

  
  export const theftTypeService = {
    async getTheftTypes(): Promise<TheftTypeInstance[]> {
      return await TheftType.findAll({
        order: [['type', 'ASC']]
      });
    },
  
    async getTheftType(id: number): Promise<TheftTypeInstance | null> {
      return await TheftType.findByPk(id);
    },
  
    async getTheftTypeByEnum(type: TheftTypeEnum): Promise<TheftTypeInstance | null> {
      return await TheftType.findOne({
        where: { type }
      });
    },
  
    async createTheftType(
      data: TheftTypeCreationAttributes
    ): Promise<TheftTypeInstance> {
      // Проверяем уникальность типа
      const existing = await TheftType.findOne({
        where: { type: data.type }
      });
      
      if (existing) {
        throw new Error('Theft type already exists');
      }
  
      return await TheftType.create(data);
    },
  
    async updateTheftType(
      id: number,
      data: Partial<TheftTypeCreationAttributes>
    ): Promise<TheftTypeInstance | null> {
      const theftType = await TheftType.findByPk(id);
      if (!theftType) return null;
  
      // Проверяем уникальность типа при изменении
      if (data.type && data.type !== theftType.type) {
        const existing = await TheftType.findOne({
          where: { type: data.type }
        });
        
        if (existing) {
          throw new Error('Theft type already exists');
        }
      }
  
      return await theftType.update(data);
    },
  
    async deleteTheftType(id: number): Promise<boolean> {
      const theftType = await TheftType.findByPk(id);
      if (!theftType) return false;
  
      await theftType.destroy();
      return true;
    }
  };