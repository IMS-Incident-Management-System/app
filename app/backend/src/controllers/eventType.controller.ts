import { Request } from 'express';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { eventTypeService } from '../services/eventType.service';
import { asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { departmentService } from '../services/department.service';

interface CreateEventTypeBody {
  title: string;
  parent_id?: number;
}

interface UpdateEventTypeBody {
  title: string;
}

export const eventTypeController = {
  getEventTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const eventTypes = await eventTypeService.getEventTypeTree();

      const transformToTreeData = (eventType: any) => ({
        event_type_id: eventType.event_type_id,
        key: String(eventType.event_type_id),
        value: eventType.event_type_id,
        title: eventType.title,
        children: eventType.children?.map(transformToTreeData) || []
      });
  
      // Only get root departments (those without parent_id)
      const rootEventTypes = eventTypes.filter(eventType => !eventType.parent_id);
      const treeData = rootEventTypes.map(transformToTreeData);
  
      res.success(
        { 
          treeData,
          total: eventTypes.length 
        }, 
        'Event types retrieved successfully'
      );
    }
  ),

  getAllEventTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const types = await eventTypeService.getAllEventTypes();
      res.success(types, 'All event types retrieved successfully');
    }
  ),

  getEventType: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const type = await eventTypeService.getEventType(Number(id));

    if (!type) {
      throw ApiError.notFound('Event type not found');
    }

    res.success(type, 'Event type retrieved successfully');
  }),

  createEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const data = req.body as CreateEventTypeBody;
      const type = await eventTypeService.createEventType(data);
      res.created(type, 'Event type created successfully');
    }
  ),

  updateEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const data = req.body as UpdateEventTypeBody;

      const type = await eventTypeService.updateEventType(Number(id), data);
      if (!type) {
        throw ApiError.notFound('Event type not found');
      }
      res.success(type, 'Event type updated successfully');
    }
  ),

  deleteEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const result = await eventTypeService.deleteEventType(Number(id));

      if (!result) {
        throw ApiError.notFound('Event type not found');
      }

      res.noContent();
    }
  ),

  getChildEventTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { parentId } = req.params;
      const types = await eventTypeService.getChildEventTypes(Number(parentId));
      res.success(types, 'Child event types retrieved successfully');
    }
  ),
};
