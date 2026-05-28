import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { operationalActivityService } from '../../services/operationalActivity.service';
import { OperationalActivityDirectionEnum } from '../../enums/operationalActivity';
import { entityMetaService } from '../../services/entityMeta.service';
import { activityBuilderService } from '../../services/activityBuilder.service';
import { getActivityActorContext } from '../../utils/activityContext';
import { EntityType } from '../../enums/entityActivity';
import { snapshotOperationalActivityRoot } from '../../utils/entitySnapshots';

interface UpdateOperationalActivityBody {
  department_id?: number;
  period_from?: Date;
  period_to?: Date;
  direction?: OperationalActivityDirectionEnum;
  // Все остальные поля опциональны
  [key: string]: any;
}

export const updateOperationalActivity = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const data = req.body as UpdateOperationalActivityBody;

    // Если указан новый department_id, проверяем его существование
    if (data.department_id) {
      const departmentExists = await operationalActivityService.validateDepartment(data.department_id);
      if (!departmentExists) {
        throw ApiError.badRequest('Department not found');
      }
    }

    const actor = getActivityActorContext(req);
    const entityId = Number(id);
    const existing = await operationalActivityService.getOperationalActivity(entityId);
    if (!existing) {
      throw ApiError.notFound('Operational activity not found');
    }

    const beforeSnapshot = snapshotOperationalActivityRoot(
      existing.get ? existing.get({ plain: true }) : existing
    );
    const updatePayload = entityMetaService.applyUpdateMeta(
      {
        ...data,
        updated_by: actor.actorExternalId ?? undefined,
      },
      actor.actorExternalId
    );

    const operationalActivity = await operationalActivityService.updateOperationalActivity(
      entityId,
      updatePayload
    );

    if (!operationalActivity) {
      throw ApiError.notFound('Operational activity not found');
    }

    const afterSnapshot = snapshotOperationalActivityRoot(operationalActivity);
    await activityBuilderService.recordFromChanges(
      EntityType.OPERATIONAL_ACTIVITY,
      entityId,
      beforeSnapshot,
      afterSnapshot,
      actor
    );

    res.success(operationalActivity, 'Operational activity updated successfully');
  }
);


