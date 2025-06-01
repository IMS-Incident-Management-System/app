import { Request } from 'express';
import { ApiError } from '../../middlewares/errorHandler.middleware';
import { TheftTypeEnum } from '../../enums/theft';
import { theftTypeService } from '../../services/incidentEvents/theft.service';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';

interface CreateTheftTypeBody {
  type: TheftTypeEnum;
  name: string;
}

export const theftTypeController = {
  getTheftTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const types = await theftTypeService.getTheftTypes();
      res.success(types, 'Theft types retrieved successfully');
    }
  ),

  getTheftType: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const type = await theftTypeService.getTheftType(Number(id));

    if (!type) {
      throw ApiError.notFound('Theft type not found');
    }

    res.success(type, 'Theft type retrieved successfully');
  }),

  createTheftType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const data = req.body as CreateTheftTypeBody;

      const type = await theftTypeService.createTheftType(data);
      res.created(type, 'Theft type created successfully');
    }
  ),

  updateTheftType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const data = req.body as Partial<CreateTheftTypeBody>;

      const type = await theftTypeService.updateTheftType(Number(id), data);
      if (!type) {
        throw ApiError.notFound('Theft type not found');
      }
      res.success(type, 'Theft type updated successfully');
    }
  ),

  deleteTheftType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const result = await theftTypeService.deleteTheftType(Number(id));

      if (!result) {
        throw ApiError.notFound('Theft type not found');
      }

      res.noContent();
    }
  ),
};
