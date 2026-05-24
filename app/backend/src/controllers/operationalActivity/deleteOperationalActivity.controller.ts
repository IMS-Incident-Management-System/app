import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { operationalActivityService } from '../../services/operationalActivity.service';

export const deleteOperationalActivity = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await operationalActivityService.deleteOperationalActivity(Number(id));

    if (!result) {
      throw ApiError.notFound('Operational activity not found');
    }

    res.noContent();
  }
);


