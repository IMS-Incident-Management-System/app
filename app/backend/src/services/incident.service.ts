import { Op, Transaction } from 'sequelize';
import { 
  Incident, 
  Department, 
  ObjectType,
  EventHistory,
  EventType,
  Additionally,
  AdditionallyPerson,
  CriminalCase,
  Punishment,
  IncidentObjectType,
  sequelize
} from '../models';
import { SecurityDirectionEnum, IncidentCreationAttributes } from '../models/incident';
import { paginate, PaginatedQuery } from '../utils/pagination';

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
}

interface GetIncidentsFilters {
  department_id?: number;
  direction?: SecurityDirectionEnum;
  object_type_id?: number;
  event_type_id?: number;
  date_from?: Date;
  date_to?: Date;
}

export const incidentService = {
  async getIncidents({ filters, pagination }: PaginatedQuery<GetIncidentsFilters>) {
    const where: any = {};
    
    if (filters?.department_id) {
      where.department_id = filters.department_id;
    }
    if (filters?.direction) {
      where.direction = filters.direction;
    }
    if (filters?.object_type_id) {
      where.object_type_id = filters.object_type_id;
    }

    // Если есть фильтры по событиям (даты или тип события), используем подзапрос
    let incidentIds: number[] | undefined;
    if (filters?.date_from || filters?.date_to || filters?.event_type_id) {
      const eventWhere: any = {};
      
      if (filters.date_from || filters.date_to) {
        eventWhere.date = {
          [Op.between]: [
            filters.date_from || new Date(0),
            filters.date_to || new Date()
          ]
        };
      }
      
      if (filters.event_type_id) {
        eventWhere.event_type_id = filters.event_type_id;
      }

      const events = await EventHistory.findAll({
        where: eventWhere,
        attributes: ['incident_id'],
        group: ['incident_id']
      });
      
      incidentIds = events.map(event => event.incident_id);
      
      if (incidentIds.length === 0) {
        // Если нет событий, соответствующих фильтрам, возвращаем пустой результат
        return { incidents: [], total: 0 };
      }
    }

    if (incidentIds) {
      where.id = { [Op.in]: incidentIds };
    }

    const result = await paginate(Incident, {
      where,
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
          model: EventHistory,
          as: 'events',
          required: false,
          include: [
            { model: EventType, as: 'event_type' },
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
          model: EventHistory,
          as: 'events',
          include: ['event_type']
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
            },
            {
              model: AdditionallyPerson,
              as: 'persons'
            }
          ]
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
    return await Incident.create(data, options);
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
          model: EventHistory,
          as: 'events',
          include: ['event_type']
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
          model: EventHistory,
          as: 'events',
          include: ['event_type']
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