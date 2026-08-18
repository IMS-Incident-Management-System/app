import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { sequelize } from '../../models';
import { entityMetaService } from '../../services/entityMeta.service';
import { activityBuilderService } from '../../services/activityBuilder.service';
import { getActivityActorContext } from '../../utils/activityContext';
import { EntityType } from '../../enums/entityActivity';
import { snapshotIncidentRoot } from '../../utils/entitySnapshots';

export const patchIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const { is_sent_1db } = req.body as { is_sent_1db?: boolean };

    if (typeof is_sent_1db !== 'boolean') {
      throw ApiError.badRequest('Поле is_sent_1db должно быть boolean');
    }

    const actor = getActivityActorContext(req);
    const incidentId = Number(id);

    const existingIncident = await incidentService.getIncident(incidentId);
    if (!existingIncident) {
      throw ApiError.notFound('Incident not found');
    }

    const beforeRootSnapshot = snapshotIncidentRoot(existingIncident);

    await sequelize.transaction(async (transaction) => {
      const incident = await incidentService.patchIncident(
        incidentId,
        entityMetaService.applyUpdateMeta(
          { is_sent_1db },
          actor.actorExternalId
        ),
        { transaction }
      );

      if (!incident) {
        throw ApiError.notFound('Incident not found');
      }

      await activityBuilderService.recordFromChanges(
        EntityType.INCIDENT,
        incidentId,
        beforeRootSnapshot,
        { ...beforeRootSnapshot, is_sent_1db },
        actor,
        { transaction }
      );
    });

    const fullIncident = await incidentService.getIncident(incidentId);
    res.success(fullIncident, 'Incident updated successfully');
  }
);
