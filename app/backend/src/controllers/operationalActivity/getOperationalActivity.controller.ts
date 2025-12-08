import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { operationalActivityService } from '../../services/operationalActivity.service';

export const getOperationalActivity = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const operationalActivity = await operationalActivityService.getOperationalActivity(Number(id));

    if (!operationalActivity) {
      throw ApiError.notFound('Operational activity not found');
    }

    res.success(operationalActivity, 'Operational activity retrieved successfully');
  }
);


