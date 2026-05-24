import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { operationalActivityService } from '../../services/operationalActivity.service';
import { OperationalActivityDirectionEnum } from '../../enums/operationalActivity';

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

    const operationalActivity = await operationalActivityService.updateOperationalActivity(Number(id), data);

    if (!operationalActivity) {
      throw ApiError.notFound('Operational activity not found');
    }

    res.success(operationalActivity, 'Operational activity updated successfully');
  }
);


