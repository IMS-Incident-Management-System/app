import { Op, Transaction } from 'sequelize';
import { Event, Department } from '../models';
import { EventCreationAttributes } from '../models/event';
import { paginate, PaginatedQuery } from '../utils/pagination';
import { EventDirectionEnum } from '../enums/event';

interface CreateEventData extends Omit<EventCreationAttributes, 'id'> {}

interface UpdateEventData extends Partial<Omit<EventCreationAttributes, 'id'>> {}

interface GetEventsFilters {
  department_id?: number;
  direction?: EventDirectionEnum;
  category?: string;
  period_from?: Date;
  period_to?: Date;
  created_by?: string;
}

export const eventService = {
  /**
   * Получение списка событий с фильтрами и пагинацией
   */
  async getEvents({ filters, pagination }: PaginatedQuery<GetEventsFilters>) {
    const where: any = {};

    if (filters?.department_id) {
      where.department_id = filters.department_id;
    }
    if (filters?.direction) {
      where.direction = filters.direction;
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.created_by) {
      where.created_by = filters.created_by;
    }

    // Фильтр по периоду
    if (filters?.period_from || filters?.period_to) {
      where.period_from = {
        [Op.between]: [
          filters.period_from || new Date(0),
          filters.period_to || new Date(),
        ],
      };
    }

    const result = await paginate(Event, {
      where,
      include: [
        {
          model: Department,
          as: 'department',
        },
      ],
      order: [['period_from', 'DESC'], ['createdAt', 'DESC']],
      pagination,
    });

    return {
      events: result.items,
      total: result.total,
    };
  },

  /**
   * Получение одного события по ID
   */
  async getEvent(id: number) {
    return await Event.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
        },
      ],
    });
  },

  /**
   * Создание нового события
   */
  async createEvent(
    data: CreateEventData,
    options?: { transaction?: Transaction }
  ) {
    return await Event.create(data, options);
  },

  /**
   * Обновление события
   */
  async updateEvent(
    id: number,
    data: UpdateEventData,
    options?: { transaction?: Transaction }
  ) {
    const event = await Event.findByPk(id);
    if (!event) return null;

    await event.update(data, options);

    // Возвращаем обновленное событие с зависимостями
    return await Event.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
        },
      ],
    });
  },

  /**
   * Удаление события
   */
  async deleteEvent(id: number, options?: { transaction?: Transaction }) {
    const event = await Event.findByPk(id);
    if (!event) return false;

    await event.destroy(options);
    return true;
  },

  /**
   * Проверка существования подразделения
   */
  async validateDepartment(id: number) {
    const department = await Department.findByPk(id);
    return !!department;
  },

  /**
   * Получение статистики по событиям
   */
  async getStatistics(filters: {
    department_id?: number;
    direction?: EventDirectionEnum;
    period_from?: Date;
    period_to?: Date;
  }) {
    const where: any = {};

    if (filters.department_id) {
      where.department_id = filters.department_id;
    }
    if (filters.direction) {
      where.direction = filters.direction;
    }
    if (filters.period_from || filters.period_to) {
      where.period_from = {
        [Op.between]: [
          filters.period_from || new Date(0),
          filters.period_to || new Date(),
        ],
      };
    }

    const events = await Event.findAll({
      where,
      include: [
        {
          model: Department,
          as: 'department',
        },
      ],
    });

    // Подсчет различных метрик в зависимости от направления
    return {
      total: events.length,
      by_direction: {
        ECONOMIC: events.filter((e) => e.direction === 'ECONOMIC').length,
        INFORMATION: events.filter((e) => e.direction === 'INFORMATION').length,
        SECURITY: events.filter((e) => e.direction === 'SECURITY').length,
      },
      // Можно добавить больше агрегатов по необходимости
    };
  },
};

