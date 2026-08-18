import { Op, Transaction } from 'sequelize';
import { 
  Incident, 
  Department, 
  ObjectType,
  IncidentEvent,
  IncidentEventType,
  Additionally,
  AdditionallyPerson,
  CriminalCase,
  Punishment,
  IncidentObjectType,
  IncidentAttachment,
  IncidentEventAttachment,
  sequelize
} from '../models';
import { SecurityDirectionEnum, IncidentCreationAttributes } from '../models/incident';
import { paginate, PaginatedQuery } from '../utils/pagination';
import { generateIncidentCode } from '../utils/codeGenerator';

interface CreateIncidentData {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
  is_db: boolean;
  description?: string;
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
  detected_damage?: number;
  recovered_damage?: number;
  prevented_damage?: number;
  additional_income?: number;
  reduced_cost?: number;
}

interface UpdateIncidentData {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
  is_db: boolean;
  description?: string;
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
  detected_damage?: number;
  recovered_damage?: number;
  prevented_damage?: number;
  additional_income?: number;
  reduced_cost?: number;
  updated_by?: string;
}

interface GetIncidentsFilters {
  department_id?: number | number[];
  direction?: SecurityDirectionEnum | SecurityDirectionEnum[];
  object_type_id?: number | number[];
  event_type_id?: number | number[];
  date_from?: Date;
  date_to?: Date;
  code?: string;
  is_db?: boolean;
  is_sent_1db?: boolean;
}

function toNumberList(value?: number | number[]): number[] {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value]).filter((item) => Number.isFinite(item));
}

function toDirectionList(
  value?: SecurityDirectionEnum | SecurityDirectionEnum[]
): SecurityDirectionEnum[] {
  if (value == null) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function inFilter<T>(values: T[]) {
  return values.length === 1 ? values[0] : { [Op.in]: values };
}

export const incidentService = {
  async getIncidents({ filters, pagination }: PaginatedQuery<GetIncidentsFilters>) {
    const where: any = {};
    const idConstraints: number[][] = [];

    const departmentIds = toNumberList(filters?.department_id);
    if (departmentIds.length) {
      where.department_id = inFilter(departmentIds);
    }

    const directions = toDirectionList(filters?.direction);
    if (directions.length) {
      where.direction = inFilter(directions);
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
    if (filters?.is_sent_1db !== undefined) {
      where.is_sent_1db = filters.is_sent_1db;
    }

    const objectTypeIds = toNumberList(filters?.object_type_id);
    if (objectTypeIds.length) {
      const junctionRows = await IncidentObjectType.findAll({
        where: { object_type_id: { [Op.in]: objectTypeIds } },
        attributes: ['incident_id'],
        group: ['incident_id'],
      });
      const matchedIds = new Set(junctionRows.map((row) => row.incident_id));
      const legacyRows = await Incident.findAll({
        where: { object_type_id: { [Op.in]: objectTypeIds } },
        attributes: ['id'],
      });
      legacyRows.forEach((row) => matchedIds.add(row.id));
      idConstraints.push([...matchedIds]);
    }

    const eventTypeIds = toNumberList(filters?.event_type_id);
    if (filters?.date_from || filters?.date_to || eventTypeIds.length) {
      const eventWhere: any = {};

      if (filters?.date_from || filters?.date_to) {
        eventWhere.date = {
          [Op.between]: [
            filters?.date_from || new Date(0),
            filters?.date_to || new Date()
          ]
        };
      }

      if (eventTypeIds.length) {
        eventWhere.event_type_id = inFilter(eventTypeIds);
      }

      const events = await IncidentEvent.findAll({
        where: eventWhere,
        attributes: ['incident_id'],
        group: ['incident_id']
      });

      idConstraints.push(events.map((event) => event.incident_id));
    }

    if (idConstraints.length) {
      let incidentIds = idConstraints[0];
      for (const next of idConstraints.slice(1)) {
        const nextSet = new Set(next);
        incidentIds = incidentIds.filter((id) => nextSet.has(id));
      }

      if (incidentIds.length === 0) {
        return { incidents: [], total: 0 };
      }

      where.id = { [Op.in]: incidentIds };
    }

    const result = await paginate(Incident, {
      where,
      // Включаем distinct, чтобы корректно считать total при join'ах с событиями
      distinct: true,
      col: 'id',
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: ObjectType,
          as: 'object_type'
        },
        {
          model: ObjectType,
          as: 'object_types'
        },
        {
          model: IncidentEvent,
          as: 'events',
          required: false,
          include: [
            {
              model: IncidentEventType,
              as: 'event_type',
              include: [{ model: IncidentEventType, as: 'parent', attributes: ['event_type_id', 'title'] }],
            },
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      pagination
    });

    return {
      incidents: result.items,
      total: result.total
    };
  },

  async getIncident(id: number) {
    return await Incident.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: ObjectType,
          as: 'object_type'
        },
        {
          model: ObjectType,
          as: 'object_types'
        },
        {
          model: IncidentEvent,
          as: 'events',
          separate: true,
          order: [['id', 'ASC']],
          include: [
            {
              model: IncidentEventType,
              as: 'event_type',
              include: [{ model: IncidentEventType, as: 'parent', attributes: ['event_type_id', 'title'] }],
            },
            {
              model: IncidentEventAttachment,
              as: 'attachments'
            }
          ]
        },
        {
          model: Additionally,
          as: 'additionally',
          separate: true,
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: CriminalCase,
              as: 'criminal_case'
            },
            {
              model: Punishment,
              as: 'punishment'
            },
            {
              model: AdditionallyPerson,
              as: 'persons'
            }
          ]
        },
        {
          model: IncidentAttachment,
          as: 'attachments'
        },
        'addresses',
        'persons'
      ]
    });
  },

  async createIncident(
    data: IncidentCreationAttributes,
    options?: { transaction?: Transaction }
  ) {
    const code = await generateIncidentCode();
    return await Incident.create({ ...data, code }, options);
  },

  async updateIncident(
    id: number,
    data: UpdateIncidentData,
    options?: { transaction?: Transaction }
  ) {
    const incident = await Incident.findByPk(id);
    if (!incident) return null;

    // Update main incident data
    await incident.update({
      department_id: data.department_id,
      direction: data.direction,
      object_type_id: data.object_type_id,
      is_db: data.is_db,
      description: data.description,
      source_last_name: data.source_last_name,
      source_first_name: data.source_first_name,
      source_middle_name: data.source_middle_name,
      source_position: data.source_position,
      detected_damage: data.detected_damage,
      recovered_damage: data.recovered_damage,
      prevented_damage: data.prevented_damage,
      additional_income: data.additional_income,
      reduced_cost: data.reduced_cost,
      updated_by: data.updated_by,
    }, options);


    // Return updated incident with all relations
    return await Incident.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: ObjectType,
          as: 'object_type'
        },
        {
          model: ObjectType,
          as: 'object_types'
        },
        {
          model: IncidentEvent,
          as: 'events',
          include: [
            'event_type',
            {
              model: IncidentEventAttachment,
              as: 'attachments'
            }
          ]
        },
        {
          model: Additionally,
          as: 'additionally',
          include: [
            {
              model: CriminalCase,
              as: 'criminal_case'
            },
            {
              model: Punishment,
              as: 'punishment'
            }
          ]
        },
        {
          model: IncidentAttachment,
          as: 'attachments'
        },
        'addresses',
        'persons'
      ]
    });
  },

  async deleteIncident(
    id: number,
    options?: { transaction?: Transaction }
  ) {
    const incident = await Incident.findByPk(id);
    if (!incident) return false;

    await incident.destroy(options);
    return true;
  },

  async patchIncident(
    id: number,
    data: { is_sent_1db?: boolean; updated_by?: string },
    options?: { transaction?: Transaction }
  ) {
    const incident = await Incident.findByPk(id);
    if (!incident) return null;

    await incident.update(
      {
        ...(data.is_sent_1db !== undefined ? { is_sent_1db: data.is_sent_1db } : {}),
        updated_by: data.updated_by,
      },
      options
    );

    return incident;
  },

  // Вспомогательные методы для проверки существования связанных сущностей
  async validateDepartment(id: number) {
    const department = await Department.findByPk(id);
    return !!department;
  },


  // Метод для получения статистики
  async getStatistics(filters: {
    department_id?: number;
    date_from?: Date;
    date_to?: Date;
  }) {
    const where: any = {};
    
    if (filters.department_id) {
      where.department_id = filters.department_id;
    }
    if (filters.date_from || filters.date_to) {
      where.createdAt = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    const incidents = await Incident.findAll({
      where,
      include: [
        {
          model: IncidentEvent,
          as: 'events',
          include: [
            'event_type',
            {
              model: IncidentEventAttachment,
              as: 'attachments'
            }
          ]
        },
        'additionally'
      ]
    });

    return {
      total: incidents.length,
      total_detected_damage: incidents.reduce((sum, incident) => 
        sum + (incident?.additionally ?? [])?.reduce((addSum, add) => 
          addSum + Number(add.detected_damage || 0), 0
        ) || 0, 0
      ),
      total_prevented_damage: incidents.reduce((sum, incident) => 
        sum + (incident?.additionally ?? [])?.reduce((addSum, add) => 
          addSum + Number(add.prevented_damage || 0), 0
        ) || 0, 0
      ),
      total_recovered_damage: incidents.reduce((sum, incident) => 
        sum + (incident?.additionally ?? [])?.reduce((addSum, add) => 
          addSum + Number(add.recovered_damage || 0), 0
        ) || 0, 0
      ),
    };
  }
}; 