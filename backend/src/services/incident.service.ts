import { Op, Transaction } from 'sequelize';
import { 
  Incident, 
  Department, 
  ObjectModel,
  EventHistory,
  EventType,
  CriminalCase
} from '../models';
import { SecurityDirectionEnum, IncidentStatusEnum, IncidentCreationAttributes } from '../models/incident';

interface CreateIncidentData {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_id: number;
  message: string;
  is_db: boolean;
  status: IncidentStatusEnum;
}

interface UpdateIncidentData extends Partial<CreateIncidentData> {}

interface GetIncidentsFilters {
  department_id?: number;
  direction?: SecurityDirectionEnum;
  status?: IncidentStatusEnum;
  date_from?: Date;
  date_to?: Date;
}

export const incidentService = {
  async getIncidents(filters?: GetIncidentsFilters) {
    const where: any = {};
    
    if (filters?.department_id) {
      where.department_id = filters.department_id;
    }
    if (filters?.direction) {
      where.direction = filters.direction;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    
    return await Incident.findAll({
      where,
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: ObjectModel,
          as: 'object'
        },
        {
          model: EventHistory,
          as: 'events',
          where: filters?.date_from || filters?.date_to ? {
            date: {
              [Op.between]: [
                filters.date_from || new Date(0),
                filters.date_to || new Date()
              ]
            }
          } : undefined,
          required: false,
          include: [
            { model: EventType, as: 'event_type' },
            { model: CriminalCase, as: 'criminal_cases' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  },

  async getIncident(id: number) {
    return await Incident.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: ObjectModel,
          as: 'object'
        },
        {
          model: EventHistory,
          as: 'events',
          include: ['event_type', 'criminal_cases']
        },
        'punishments'
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

    return await incident.update(data, options);
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

  async validateObject(id: number) {
    const object = await ObjectModel.findByPk(id);
    return !!object;
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
          include: ['event_type', 'criminal_cases']
        },
        'punishments'
      ]
    });

    return {
      total: incidents.length,
      by_status: incidents.reduce((acc, incident) => {
        acc[incident.status] = (acc[incident.status] || 0) + 1;
        return acc;
      }, {} as Record<IncidentStatusEnum, number>),
      total_damage: incidents.reduce((sum, incident) => 
        sum + (incident?.events ?? [])?.reduce((eventSum, event) => 
          eventSum + Number(event.damage_amount), 0
        ) || 0, 0
      ),
      total_compensation: incidents.reduce((sum, incident) => 
        sum + (incident?.events ?? [])?.reduce((eventSum, event) => 
          eventSum + Number(event.compensation_amount), 0
        ) || 0, 0
      ),
      criminal_cases_count: incidents.reduce((sum, incident) => 
        sum + (incident?.events ?? [])?.reduce((eventSum, event) => 
          eventSum + (event.criminal_cases?.length ?? 0), 0
        ) || 0, 0
      )
    };
  }
}; 