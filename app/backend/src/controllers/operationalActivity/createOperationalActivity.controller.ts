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

interface CreateOperationalActivityBody {
  department_id: number;
  period_from: Date;
  period_to: Date;
  direction: OperationalActivityDirectionEnum;
  // Все остальные поля опциональны и зависят от направления
  [key: string]: any;
}

export const createOperationalActivity = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const data = req.body as CreateOperationalActivityBody;
    const actor = getActivityActorContext(req);

    if (!data.department_id || !data.period_from || !data.period_to || !data.direction) {
      throw ApiError.badRequest('Missing required fields: department_id, period_from, period_to, direction');
    }

    // Проверяем существование подразделения
    const departmentExists = await operationalActivityService.validateDepartment(data.department_id);
    if (!departmentExists) {
      throw ApiError.badRequest('Department not found');
    }

    const operationalActivity = await operationalActivityService.createOperationalActivity(
      entityMetaService.applyCreateMeta(
        {
          ...data,
          created_by: actor.actorExternalId ?? undefined,
        },
        actor.actorExternalId
      )
    );

    await activityBuilderService.recordCreated(
      EntityType.OPERATIONAL_ACTIVITY,
      operationalActivity.id,
      actor
    );

    res.created(operationalActivity, 'Operational activity created successfully');
  }
);


