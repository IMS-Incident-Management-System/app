import { Op, Transaction } from 'sequelize';
import { 
  Incident, 
  Department, 
  ObjectType,
  EventHistory,
  EventType,
  CriminalCase,
  Punishment,
  sequelize
} from '../models';
import { SecurityDirectionEnum, IncidentCreationAttributes } from '../models/incident';
import { paginate, PaginatedQuery } from '../utils/pagination';

interface CreateIncidentData {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
  message: string;
  is_db: boolean;
}

interface UpdateIncidentData {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
  message: string;
  is_db: boolean;
  events: {
    id?: number;
    event_type_id: number;
    // адрес
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    // apartment удалён
    // ущерб
    detected_damage: number;
    prevented_damage: number;
    recovered_damage: number;
    sub_type_id?: number;
    description?: string;
    date: Date;
    criminal_cases?: {
      id?: number;
      transfer_date?: Date;
      document_number?: string;
      department_name?: string;
      review_result?: string;
      rejection_date?: Date;
      rejection_reason?: string;
      appeal_date?: Date;
      case_date?: Date;
      case_number?: string;
      law_article?: string;
      initiator?: string;
      subject?: string;
      detained_count?: number;
      person_name?: string;
      case_result?: string;
      court_decision?: string;
      convicted_count?: number;
    }[];
  }[];
  punishments?: {
    id?: number;
    punishment_type_id?: number; // делаем опциональным, т.к. FE может не слать
    description?: string;
    fired_count?: number;
    date?: Date | string;
  }[];
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
    if (filters?.date_from) {
      where.createdAt = {
        [Op.gte]: filters.date_from
      };
    }
    if (filters?.date_to) {
      where.createdAt = {
        [Op.lte]: filters.date_to
      };
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
          model: EventHistory,
          as: 'events',
          where: (() => {
            const eventWhere: any = {};
            
            if (filters?.date_from || filters?.date_to) {
              eventWhere.date = {
                [Op.between]: [
                  filters.date_from || new Date(0),
                  filters.date_to || new Date()
                ]
              };
            }
            
            if (filters?.event_type_id) {
              eventWhere.event_type_id = filters.event_type_id;
            }
            
            return Object.keys(eventWhere).length > 0 ? eventWhere : undefined;
          })(),
          required: filters?.event_type_id ? true : false,
          include: [
            { model: EventType, as: 'event_type' },
            { model: CriminalCase, as: 'criminal_cases' }
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

    // Update main incident data
    await incident.update({
      department_id: data.department_id,
      direction: data.direction,
      object_type_id: data.object_type_id,
      message: data.message,
      is_db: data.is_db
    }, options);

    // Update events - replace all events and their criminal cases
    await EventHistory.destroy({
      where: { incident_id: id },
      ...options
    });

    if (data.events?.length) {
      await Promise.all(
        data.events.map(async event => {
          const { criminal_cases, ...eventData } = event;
          // Create event
          const createdEvent = await EventHistory.create(
            { ...eventData, incident_id: id },
            options
          );

          // Create criminal cases if any
          if (criminal_cases?.length) {
            await Promise.all(
              criminal_cases.map(criminalCase =>
                CriminalCase.create(
                  { ...criminalCase, event_history_id: createdEvent.id },
                  options
                )
              )
            );
          }

          return createdEvent;
        })
      );
    }

    // Update punishments - replace all punishments ONLY if provided in payload
    if (data.punishments !== undefined) {
      await Punishment.destroy({
        where: { incident_id: id },
        ...options
      });

      if (data.punishments?.length) {
        await Promise.all(
          data.punishments.map(punishment => {
            const p: any = punishment || {};
            return Punishment.create({
              incident_id: id,
              punishment_type_id: typeof p.punishment_type_id === 'number' ? p.punishment_type_id : 1,
              description: p.description,
              fired_count: Number.isFinite(p.fired_count) ? p.fired_count : 0,
              date: p.date ? new Date(p.date as any) : new Date(),
              guilty_persons_count: Number.isFinite(p.guilty_persons_count) ? p.guilty_persons_count : 0,
              punished_persons_count: Number.isFinite(p.punished_persons_count) ? p.punished_persons_count : 0,
              warnings_count: Number.isFinite(p.warnings_count) ? p.warnings_count : 0,
              reprimands_count: Number.isFinite(p.reprimands_count) ? p.reprimands_count : 0,
              severe_reprimands_count: Number.isFinite(p.severe_reprimands_count) ? p.severe_reprimands_count : 0,
            }, options);
          })
        );
      }
    }

    // Return updated incident with all relations
    return await Incident.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department'
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
          include: ['event_type', 'criminal_cases']
        },
        'punishments'
      ]
    });

    return {
      total: incidents.length,
      total_detected_damage: incidents.reduce((sum, incident) => 
        sum + (incident?.events ?? [])?.reduce((eventSum, event) => 
          eventSum + Number(event.detected_damage), 0
        ) || 0, 0
      ),
      total_prevented_damage: incidents.reduce((sum, incident) => 
        sum + (incident?.events ?? [])?.reduce((eventSum, event) => 
          eventSum + Number(event.prevented_damage), 0
        ) || 0, 0
      ),
      total_recovered_damage: incidents.reduce((sum, incident) => 
        sum + (incident?.events ?? [])?.reduce((eventSum, event) => 
          eventSum + Number(event.recovered_damage), 0
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