import { Request } from 'express';
import { incidentService } from '../services/incident.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';

export const incidentController = {
  getIncidents: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const incidents = await incidentService.getIncidents();
    res.success(incidents, 'Incidents retrieved successfully', {
      total: incidents.length
    });
  }),

  getIncident: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const incident = await incidentService.getIncident(Number(id));
    
    if (!incident) {
      throw ApiError.notFound('Incident not found');
    }
    
    res.success(incident, 'Incident retrieved successfully');
  }),

  createIncident: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const incident = await incidentService.createIncident(req.body);
    res.created(incident, 'Incident created successfully');
  }),

  updateIncident: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const incident = await incidentService.updateIncident(Number(id), req.body);
    
    if (!incident) {
      throw ApiError.notFound('Incident not found');
    }
    
    res.success(incident, 'Incident updated successfully');
  }),

  deleteIncident: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await incidentService.deleteIncident(Number(id));
    
    if (!result) {
      throw ApiError.notFound('Incident not found');
    }
    
    res.noContent();
  })
}; 