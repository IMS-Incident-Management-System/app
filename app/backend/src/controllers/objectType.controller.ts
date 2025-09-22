import { Request } from 'express';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { objectTypeService } from '../services/objectType.service';
import { asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';

interface CreateObjectTypeBody {
  title: string;
  parent_id?: number;
}

interface UpdateObjectTypeBody {
  title: string;
}

export const objectTypeController = {
  getObjectTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const objectTypes = await objectTypeService.getObjectTypeTree();

      const transformToTreeData = (objectType: any) => ({
        object_type_id: objectType.object_type_id,
        value: objectType.object_type_id,
        title: objectType.title,
        children: objectType.children?.map(transformToTreeData) || []
      });

      // Only get root object types (those without parent_id)
      const rootObjectTypes = objectTypes.filter(objectType => !objectType.parent_id);
      const treeData = rootObjectTypes.map(transformToTreeData);

      res.success(
        { 
          treeData,
          total: objectTypes.length 
        }, 
        'Object types retrieved successfully'
      );
    }
  ),

  getAllObjectTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const types = await objectTypeService.getAllObjectTypes();
      res.success(types, 'All object types retrieved successfully');
    }
  ),

  getObjectType: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const type = await objectTypeService.getObjectType(Number(id));

    if (!type) {
      throw ApiError.notFound('Object type not found');
    }

    res.success(type, 'Object type retrieved successfully');
  }),

  createObjectType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const data = req.body as CreateObjectTypeBody;
      const type = await objectTypeService.createObjectType(data);
      res.created(type, 'Object type created successfully');
    }
  ),

  updateObjectType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const data = req.body as UpdateObjectTypeBody;

      const type = await objectTypeService.updateObjectType(Number(id), data);
      if (!type) {
        throw ApiError.notFound('Object type not found');
      }
      res.success(type, 'Object type updated successfully');
    }
  ),

  deleteObjectType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const result = await objectTypeService.deleteObjectType(Number(id));

      if (!result) {
        throw ApiError.notFound('Object type not found');
      }

      res.noContent();
    }
  ),

  getChildObjectTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { parentId } = req.params;
      const types = await objectTypeService.getChildObjectTypes(Number(parentId));
      res.success(types, 'Child object types retrieved successfully');
    }
  ),
};

