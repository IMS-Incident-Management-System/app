import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { activityService } from '../../services/activity.service';
import { EntityType } from '../../enums/entityActivity';
import { incidentService } from '../../services/incident.service';
import { eventService } from '../../services/event.service';
import { operationalActivityService } from '../../services/operationalActivity.service';

async function assertEntityExists(entityType: EntityType, entityId: number): Promise<void> {
  switch (entityType) {
    case EntityType.INCIDENT: {
      const incident = await incidentService.getIncident(entityId);
      if (!incident) throw ApiError.notFound('Incident not found');
      return;
    }
    case EntityType.EVENT: {
      const event = await eventService.getEvent(entityId);
      if (!event) throw ApiError.notFound('Event not found');
      return;
    }
    case EntityType.OPERATIONAL_ACTIVITY: {
      const oa = await operationalActivityService.getOperationalActivity(entityId);
      if (!oa) throw ApiError.notFound('Operational activity not found');
      return;
    }
  }
}

function parseCategories(value: unknown): string[] | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export const getIncidentActivity = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const entityId = Number(req.params.id);
    await assertEntityExists(EntityType.INCIDENT, entityId);
    const activities = await activityService.list(EntityType.INCIDENT, entityId, {
      limit: req.query.limit ? Number(req.query.limit) : 50,
      before: req.query.before as string | undefined,
      categories: parseCategories(req.query.categories),
    });
    res.success(activities, 'Activity retrieved successfully');
  }
);

export const getEventActivity = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const entityId = Number(req.params.id);
    await assertEntityExists(EntityType.EVENT, entityId);
    const activities = await activityService.list(EntityType.EVENT, entityId, {
      limit: req.query.limit ? Number(req.query.limit) : 50,
      before: req.query.before as string | undefined,
      categories: parseCategories(req.query.categories),
    });
    res.success(activities, 'Activity retrieved successfully');
  }
);

export const getOperationalActivityActivity = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const entityId = Number(req.params.id);
    await assertEntityExists(EntityType.OPERATIONAL_ACTIVITY, entityId);
    const activities = await activityService.list(EntityType.OPERATIONAL_ACTIVITY, entityId, {
      limit: req.query.limit ? Number(req.query.limit) : 50,
      before: req.query.before as string | undefined,
      categories: parseCategories(req.query.categories),
    });
    res.success(activities, 'Activity retrieved successfully');
  }
);
