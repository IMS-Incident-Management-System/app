import { Op, Transaction } from 'sequelize';
import IncidentEvent, { 
  IncidentEventAttributes, 
  IncidentEventCreationAttributes,
  IncidentEventInstance 
} from '../models/incidentEvent';
import IncidentEventType from '../models/incidentEventType';

export const incidentEventService = {
  async getIncidentEvents(filters?: {
    incident_id?: number;
    event_type_id?: number;
    object_id?: number;
    date_from?: Date;
    date_to?: Date;
  }): Promise<IncidentEventInstance[]> {
    const where: any = {};
    
    if (filters?.incident_id) {
      where.incident_id = filters.incident_id;
    }
    if (filters?.event_type_id) {
      where.event_type_id = filters.event_type_id;
    }
    if (filters?.object_id) {
      where.object_id = filters.object_id;
    }
    if (filters?.date_from || filters?.date_to) {
      where.date = {
        [Op.between]: [
          filters.date_from || new Date(0),
          filters.date_to || new Date()
        ]
      };
    }

    return await IncidentEvent.findAll({
      where,
      include: [
        {
          model: IncidentEventType,
          as: 'event_type'
        }
      ],
      order: [['date', 'DESC']]
    });
  },

  async getIncidentEvent(id: number): Promise<IncidentEventInstance | null> {
    return await IncidentEvent.findByPk(id, {
      include: [
        'event_type'
      ]
    });
  },

  async createIncidentEvent(
    data: IncidentEventCreationAttributes,
    options?: { transaction?: Transaction }
  ): Promise<IncidentEventInstance> {
    return await IncidentEvent.create(data, options);
  },

  async updateIncidentEvent(
    id: number,
    data: Partial<IncidentEventCreationAttributes>,
    options?: { transaction?: Transaction }
  ): Promise<IncidentEventInstance | null> {
    const incidentEvent = await IncidentEvent.findByPk(id);
    if (!incidentEvent) return null;

    return await incidentEvent.update(data, options);
  },

  async deleteIncidentEvent(
    id: number,
    options?: { transaction?: Transaction }
  ): Promise<boolean> {
    const incidentEvent = await IncidentEvent.findByPk(id);
    if (!incidentEvent) return false;

    await incidentEvent.destroy(options);
    return true;
  },

  async deleteIncidentEventsByIncidentId(
    incidentId: number,
    options?: { transaction?: Transaction }
  ): Promise<number> {
    const deletedCount = await IncidentEvent.destroy({
      where: { incident_id: incidentId },
      ...options
    });
    return deletedCount;
  },

};


