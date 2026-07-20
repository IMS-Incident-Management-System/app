import { Op, Transaction } from 'sequelize';
import { 
  Event, 
  Department, 
  EventCriminalCase,
  EventPunishment,
  sequelize
} from '../models';
import { EventCreationAttributes } from '../models/event';
import { paginate, PaginatedQuery } from '../utils/pagination';
import { generateEventCode } from '../utils/codeGenerator';
import { parseDateOnly, requireDateOnly } from '../utils/dateOnly';

interface CreateEventData {
  department_id: number;
  date: Date;
  is_service_investigation: boolean;
  is_service_investigation_ib: boolean;
  is_service_investigation_bpio: boolean;
  is_service_investigation_bpio_hotline: boolean;
  is_service_check: boolean;
  is_service_check_ib: boolean;
  is_service_check_bpio: boolean;
  is_service_check_bpio_hotline: boolean;
  is_verification_activity: boolean;
  is_db: boolean;
  description?: string;
  entry_date?: Date;
  detected_damage?: number;
  recovered_damage?: number;
  prevented_damage?: number;
  additional_income?: number;
  reduced_cost?: number;
  prevented_unnecessary_writeoff?: number;
  vat_deducted?: number;
  created_by?: string;
  updated_by?: string;
}

interface UpdateEventData {
  department_id: number;
  date: Date;
  is_service_investigation: boolean;
  is_service_investigation_ib: boolean;
  is_service_investigation_bpio: boolean;
  is_service_investigation_bpio_hotline: boolean;
  is_service_check: boolean;
  is_service_check_ib: boolean;
  is_service_check_bpio: boolean;
  is_service_check_bpio_hotline: boolean;
  is_verification_activity: boolean;
  is_db: boolean;
  description?: string;
  entry_date?: Date;
  detected_damage?: number;
  recovered_damage?: number;
  prevented_damage?: number;
  additional_income?: number;
  reduced_cost?: number;
  prevented_unnecessary_writeoff?: number;
  vat_deducted?: number;
  updated_by?: string;
}

interface GetEventsFilters {
  department_id?: number;
  date_from?: Date;
  date_to?: Date;
  code?: string;
  is_db?: boolean;
}

export const eventService = {
  async getEvents({ filters, pagination }: PaginatedQuery<GetEventsFilters>) {
    const where: any = {};
    
    if (filters?.department_id) {
      where.department_id = filters.department_id;
    }
    if (filters?.date_from || filters?.date_to) {
      where.date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }
    if (filters?.code) {
      // Экранируем специальные символы для LIKE
      const escapedCode = filters.code.replace(/[%_\\]/g, '\\$&');
      where.code = {
        [Op.iLike]: `%${escapedCode}%`
      };
    }
    if (filters?.is_db !== undefined) {
      where.is_db = filters.is_db;
    }

    const result = await paginate(Event, {
      where,
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: EventCriminalCase,
          as: 'criminal_case',
          required: false
        },
        {
          model: EventPunishment,
          as: 'punishment',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      pagination
    });

    return {
      events: result.items,
      total: result.total
    };
  },

  async getEvent(id: number) {
    return await Event.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: EventCriminalCase,
          as: 'criminal_case',
          required: false
        },
        {
          model: EventPunishment,
          as: 'punishment',
          required: false
        }
      ]
    });
  },

  async createEvent(
    data: EventCreationAttributes,
    options?: { transaction?: Transaction }
  ) {
    const code = await generateEventCode();
    return await Event.create(
      {
        ...data,
        code,
        date: requireDateOnly(data.date as unknown as string | Date),
        entry_date: parseDateOnly(data.entry_date as unknown as string | Date | null | undefined),
      },
      options
    );
  },

  async updateEvent(
    id: number,
    data: UpdateEventData,
    options?: { transaction?: Transaction }
  ) {
    const event = await Event.findByPk(id);
    if (!event) return null;

    await event.update({
      department_id: data.department_id,
      date: requireDateOnly(data.date as unknown as string | Date),
      is_service_investigation: data.is_service_investigation,
      is_service_investigation_ib: data.is_service_investigation_ib,
      is_service_investigation_bpio: data.is_service_investigation_bpio,
      is_service_investigation_bpio_hotline: data.is_service_investigation_bpio_hotline,
      is_service_check: data.is_service_check,
      is_service_check_ib: data.is_service_check_ib,
      is_service_check_bpio: data.is_service_check_bpio,
      is_service_check_bpio_hotline: data.is_service_check_bpio_hotline,
      is_verification_activity: data.is_verification_activity,
      is_db: data.is_db,
      description: data.description,
      entry_date: parseDateOnly(data.entry_date as unknown as string | Date | null | undefined),
      detected_damage: data.detected_damage,
      recovered_damage: data.recovered_damage,
      prevented_damage: data.prevented_damage,
      additional_income: data.additional_income,
      reduced_cost: data.reduced_cost,
      prevented_unnecessary_writeoff: data.prevented_unnecessary_writeoff,
      vat_deducted: data.vat_deducted,
      updated_by: data.updated_by,
    }, options);

    return await Event.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: EventCriminalCase,
          as: 'criminal_case',
          required: false
        },
        {
          model: EventPunishment,
          as: 'punishment',
          required: false
        }
      ]
    });
  },

  async deleteEvent(
    id: number,
    options?: { transaction?: Transaction }
  ) {
    const event = await Event.findByPk(id);
    if (!event) return false;

    await event.destroy(options);
    return true;
  },

  async validateDepartment(id: number) {
    const department = await Department.findByPk(id);
    return !!department;
  },
};

