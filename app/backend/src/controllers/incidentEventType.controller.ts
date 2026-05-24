import { Request } from 'express';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { incidentEventTypeService } from '../services/incidentEventType.service';
import { asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { departmentService } from '../services/department.service';

interface CreateIncidentEventTypeBody {
  title: string;
  parent_id?: number;
}

interface UpdateIncidentEventTypeBody {
  title: string;
}

export const incidentEventTypeController = {
  getIncidentEventTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const incidentEventTypes = await incidentEventTypeService.getIncidentEventTypeTree();

      const transformToTreeData = (incidentEventType: any) => ({
        event_type_id: incidentEventType.event_type_id,
        key: String(incidentEventType.event_type_id),
        value: incidentEventType.event_type_id,
        title: incidentEventType.title,
        children: incidentEventType.children?.map(transformToTreeData) || []
      });
  
      // Only get root types (those without parent_id)
      const rootIncidentEventTypes = incidentEventTypes.filter(incidentEventType => !incidentEventType.parent_id);
      const treeData = rootIncidentEventTypes.map(transformToTreeData);
  
      res.success(
        { 
          treeData,
          total: incidentEventTypes.length 
        }, 
        'Incident event types retrieved successfully'
      );
    }
  ),

  getAllIncidentEventTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const types = await incidentEventTypeService.getAllIncidentEventTypes();
      res.success(types, 'All incident event types retrieved successfully');
    }
  ),

  getIncidentEventType: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const type = await incidentEventTypeService.getIncidentEventType(Number(id));

    if (!type) {
      throw ApiError.notFound('Incident event type not found');
    }

    res.success(type, 'Incident event type retrieved successfully');
  }),

  createIncidentEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const data = req.body as CreateIncidentEventTypeBody;
      const type = await incidentEventTypeService.createIncidentEventType(data);
      res.created(type, 'Incident event type created successfully');
    }
  ),

  updateIncidentEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const data = req.body as UpdateIncidentEventTypeBody;

      const type = await incidentEventTypeService.updateIncidentEventType(Number(id), data);
      if (!type) {
        throw ApiError.notFound('Incident event type not found');
      }
      res.success(type, 'Incident event type updated successfully');
    }
  ),

  deleteIncidentEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const result = await incidentEventTypeService.deleteIncidentEventType(Number(id));

      if (!result) {
        throw ApiError.notFound('Incident event type not found');
      }

      res.noContent();
    }
  ),

  getChildIncidentEventTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { parentId } = req.params;
      const types = await incidentEventTypeService.getChildIncidentEventTypes(Number(parentId));
      res.success(types, 'Child incident event types retrieved successfully');
    }
  ),
};


