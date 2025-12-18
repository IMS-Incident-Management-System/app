import EventType, {
  EventTypeInstance,
  EventTypeAttributes,
} from '../models/eventType';

interface EventTypeTree extends EventTypeAttributes {
  children: EventTypeTree[];
}

interface CreateEventTypeData {
  title: string;
  parent_id?: number | null;
}

interface UpdateEventTypeData {
  title: string;
}

export const eventTypeService = {
  async getAllEventTypes(): Promise<EventTypeInstance[]> {
    return await EventType.findAll({
      order: [['title', 'ASC']],
    });
  },

  async getEventTypeTree(): Promise<EventTypeTree[]> {
    // Получаем все типы событий
    const eventTypes = await EventType.findAll({
      order: [['title', 'ASC']],
    });

    // Создаем Map для быстрого поиска типов по ID
    const eventTypeMap = new Map<number, EventTypeTree>();

    // Инициализируем Map
    eventTypes.forEach((type) => {
      const typeData = type.toJSON() as EventTypeAttributes;
      eventTypeMap.set(typeData.event_type_id, { ...typeData, children: [] });
    });

    // Строим дерево
    eventTypes.forEach((type) => {
      const typeData = type.toJSON() as EventTypeAttributes;
      if (typeData.parent_id && eventTypeMap.has(typeData.parent_id)) {
        const parent = eventTypeMap.get(typeData.parent_id);
        if (parent) {
          const child = eventTypeMap.get(typeData.event_type_id);
          if (child) {
            parent.children.push(child);
          }
        }
      }
    });

    // Возвращаем только корневые типы
    return Array.from(eventTypeMap.values()).filter((type) => !type.parent_id);
  },

  async getEventType(id: number): Promise<EventTypeInstance | null> {
    return await EventType.findByPk(id, {
      include: [
        {
          model: EventType,
          as: 'children',
        },
      ],
    });
  },

  async createEventType(data: CreateEventTypeData): Promise<EventTypeInstance> {
    // value будет автоматически сгенерировано в хуке beforeValidate
    return await EventType.create({
      title: data.title,
      parent_id: data.parent_id || null,
      value: '', // временное значение, будет перезаписано в хуке
    });
  },

  async updateEventType(
    id: number,
    data: UpdateEventTypeData
  ): Promise<EventTypeInstance | null> {
    const eventType = await EventType.findByPk(id);
    if (!eventType) return null;

    await eventType.update({
      title: data.title,
    });
    return eventType;
  },

  async deleteEventType(id: number): Promise<boolean> {
    const eventType = await EventType.findByPk(id);
    if (!eventType) return false;

    // Рекурсивная функция для получения всех ID дочерних типов
    const getAllChildrenIds = async (parentId: number): Promise<number[]> => {
      const children = await EventType.findAll({
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
      await EventType.destroy({
        where: {
          event_type_id: childrenIds,
        },
      });
    }

    // Удаляем сам тип
    await eventType.destroy();

    return true;
  },

  async getChildEventTypes(parentId: number): Promise<EventTypeInstance[]> {
    return await EventType.findAll({
      where: { parent_id: parentId },
      order: [['title', 'ASC']],
    });
  },
};
