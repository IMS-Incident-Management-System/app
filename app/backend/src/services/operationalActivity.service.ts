import { Op, Transaction } from 'sequelize';
import { OperationalActivity, Department } from '../models';
import { OperationalActivityCreationAttributes } from '../models/operationalActivity';
import { paginate, PaginatedQuery } from '../utils/pagination';
import { OperationalActivityDirectionEnum } from '../enums/operationalActivity';
import { generateOperationalActivityCode } from '../utils/codeGenerator';

interface CreateOperationalActivityData extends Omit<OperationalActivityCreationAttributes, 'id'> {}

interface UpdateOperationalActivityData extends Partial<Omit<OperationalActivityCreationAttributes, 'id'>> {}

interface GetOperationalActivitiesFilters {
  department_id?: number | number[];
  direction?: OperationalActivityDirectionEnum | OperationalActivityDirectionEnum[];
  period_from?: Date;
  period_to?: Date;
  created_by?: string;
  code?: string;
}

function toNumberList(value?: number | number[]): number[] {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value]).filter((item) => Number.isFinite(item));
}

function toDirectionList(
  value?: OperationalActivityDirectionEnum | OperationalActivityDirectionEnum[]
): OperationalActivityDirectionEnum[] {
  if (value == null) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function inFilter<T>(values: T[]) {
  return values.length === 1 ? values[0] : { [Op.in]: values };
}

export const operationalActivityService = {
  /**
   * Получение списка операционной деятельности с фильтрами и пагинацией
   */
  async getOperationalActivities({ filters, pagination }: PaginatedQuery<GetOperationalActivitiesFilters>) {
    const where: any = {};

    const departmentIds = toNumberList(filters?.department_id);
    if (departmentIds.length) {
      where.department_id = inFilter(departmentIds);
    }

    const directions = toDirectionList(filters?.direction);
    if (directions.length) {
      where.direction = inFilter(directions);
    }
    if (filters?.created_by) {
      where.created_by = filters.created_by;
    }
    if (filters?.code) {
      // Экранируем специальные символы для LIKE
      const escapedCode = filters.code.replace(/[%_\\]/g, '\\$&');
      where.code = {
        [Op.iLike]: `%${escapedCode}%`
      };
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

    const result = await paginate(OperationalActivity, {
      where,
      include: [
        {
          model: Department,
          as: 'department',
        },
      ],
      order: [['createdAt', 'DESC'], ['period_from', 'DESC']],
      pagination,
    });

    return {
      operationalActivities: result.items,
      total: result.total,
    };
  },

  /**
   * Получение одной операционной деятельности по ID
   */
  async getOperationalActivity(id: number) {
    return await OperationalActivity.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
        },
      ],
    });
  },

  /**
   * Создание новой операционной деятельности
   */
  async createOperationalActivity(
    data: CreateOperationalActivityData,
    options?: { transaction?: Transaction }
  ) {
    const code = await generateOperationalActivityCode();
    return await OperationalActivity.create({ ...data, code }, options);
  },

  /**
   * Обновление операционной деятельности
   */
  async updateOperationalActivity(
    id: number,
    data: UpdateOperationalActivityData,
    options?: { transaction?: Transaction }
  ) {
    const operationalActivity = await OperationalActivity.findByPk(id);
    if (!operationalActivity) return null;

    await operationalActivity.update(data, options);

    // Возвращаем обновленную операционную деятельность с зависимостями
    return await OperationalActivity.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
        },
      ],
    });
  },

  /**
   * Удаление операционной деятельности
   */
  async deleteOperationalActivity(id: number, options?: { transaction?: Transaction }) {
    const operationalActivity = await OperationalActivity.findByPk(id);
    if (!operationalActivity) return false;

    await operationalActivity.destroy(options);
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
   * Получение статистики по операционной деятельности
   */
  async getStatistics(filters: {
    department_id?: number;
    direction?: OperationalActivityDirectionEnum;
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

    const operationalActivities = await OperationalActivity.findAll({
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
      total: operationalActivities.length,
      by_direction: {
        ECONOMIC: operationalActivities.filter((oa) => oa.direction === 'ECONOMIC').length,
        INFORMATION: operationalActivities.filter((oa) => oa.direction === 'INFORMATION').length,
        SECURITY: operationalActivities.filter((oa) => oa.direction === 'SECURITY').length,
        CYBER: operationalActivities.filter((oa) => oa.direction === 'CYBER').length,
        ANTIFRAUD: operationalActivities.filter((oa) => oa.direction === 'ANTIFRAUD').length,
        SORM: operationalActivities.filter((oa) => oa.direction === 'SORM').length,
      },
      // Можно добавить больше агрегатов по необходимости
    };
  },
};

