import IncidentEventType, {
  IncidentEventTypeInstance,
  IncidentEventTypeAttributes,
} from '../models/incidentEventType';

interface IncidentEventTypeTree extends IncidentEventTypeAttributes {
  children: IncidentEventTypeTree[];
}

interface CreateIncidentEventTypeData {
  title: string;
  parent_id?: number | null;
}

interface UpdateIncidentEventTypeData {
  title: string;
}

export const incidentEventTypeService = {
  async getAllIncidentEventTypes(): Promise<IncidentEventTypeInstance[]> {
    return await IncidentEventType.findAll({
      order: [['title', 'ASC']],
    });
  },

  async getIncidentEventTypeTree(): Promise<IncidentEventTypeTree[]> {
    // Получаем все типы событий инцидентов
    const incidentEventTypes = await IncidentEventType.findAll({
      order: [['title', 'ASC']],
    });

    // Создаем Map для быстрого поиска типов по ID
    const incidentEventTypeMap = new Map<number, IncidentEventTypeTree>();

    // Инициализируем Map
    incidentEventTypes.forEach((type) => {
      const typeData = type.toJSON() as IncidentEventTypeAttributes;
      incidentEventTypeMap.set(typeData.event_type_id, { ...typeData, children: [] });
    });

    // Строим дерево
    incidentEventTypes.forEach((type) => {
      const typeData = type.toJSON() as IncidentEventTypeAttributes;
      if (typeData.parent_id && incidentEventTypeMap.has(typeData.parent_id)) {
        const parent = incidentEventTypeMap.get(typeData.parent_id);
        if (parent) {
          const child = incidentEventTypeMap.get(typeData.event_type_id);
          if (child) {
            parent.children.push(child);
          }
        }
      }
    });

    // Возвращаем только корневые типы
    return Array.from(incidentEventTypeMap.values()).filter((type) => !type.parent_id);
  },

  async getIncidentEventType(id: number): Promise<IncidentEventTypeInstance | null> {
    return await IncidentEventType.findByPk(id, {
      include: [
        {
          model: IncidentEventType,
          as: 'children',
        },
      ],
    });
  },

  async createIncidentEventType(data: CreateIncidentEventTypeData): Promise<IncidentEventTypeInstance> {
    // value будет автоматически сгенерировано в хуке beforeValidate
    return await IncidentEventType.create({
      title: data.title,
      parent_id: data.parent_id || null,
      value: '', // временное значение, будет перезаписано в хуке
    });
  },

  async updateIncidentEventType(
    id: number,
    data: UpdateIncidentEventTypeData
  ): Promise<IncidentEventTypeInstance | null> {
    const incidentEventType = await IncidentEventType.findByPk(id);
    if (!incidentEventType) return null;

    await incidentEventType.update({
      title: data.title,
    });
    return incidentEventType;
  },

  async deleteIncidentEventType(id: number): Promise<boolean> {
    const incidentEventType = await IncidentEventType.findByPk(id);
    if (!incidentEventType) return false;

    // Рекурсивная функция для получения всех ID дочерних типов
    const getAllChildrenIds = async (parentId: number): Promise<number[]> => {
      const children = await IncidentEventType.findAll({
        where: { parent_id: parentId },
      });

      const childrenIds = children.map((child) => child.event_type_id);
      const descendantIds = await Promise.all(
        childrenIds.map((childId) => getAllChildrenIds(childId))
      );

      return [...childrenIds, ...descendantIds.flat()];
    };

    // Получаем все ID дочерних типов
    const childrenIds = await getAllChildrenIds(id);

    // Удаляем все типы одним запросом
    if (childrenIds.length > 0) {
      await IncidentEventType.destroy({
        where: {
          event_type_id: childrenIds,
        },
      });
    }

    // Удаляем сам тип
    await incidentEventType.destroy();

    return true;
  },

  async getChildIncidentEventTypes(parentId: number): Promise<IncidentEventTypeInstance[]> {
    return await IncidentEventType.findAll({
      where: { parent_id: parentId },
      order: [['title', 'ASC']],
    });
  },
};


