import IncidentModel, { IncidentModelType } from '../models/incident';
import DepartmentModel from '../models/department';

export const incidentService = {
  getIncidents: async () => {
    return await IncidentModel.findAll({
      include: [{
        model: DepartmentModel,
        as: 'department'
      }]
    });
  },

  getIncident: async (id: number) => {
    return await IncidentModel.findByPk(id, {
      include: [{
        model: DepartmentModel,
        as: 'department'
      }]
    });
  },

  createIncident: async (data: Omit<IncidentModelType, 'incident_id'>) => {
    return await IncidentModel.create(data);
  },

  updateIncident: async (id: number, data: Partial<Omit<IncidentModelType, 'incident_id'>>) => {
    const incident = await IncidentModel.findByPk(id);
    if (!incident) return null;
    return await incident.update(data);
  },

  deleteIncident: async (id: number) => {
    const incident = await IncidentModel.findByPk(id);
    if (!incident) return false;
    await incident.destroy();
    return true;
  }
}; 