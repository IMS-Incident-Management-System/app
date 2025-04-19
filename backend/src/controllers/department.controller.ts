import { Request } from 'express';
import { departmentService } from '../services/department.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';

export const departmentController = {
  getDepartments: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    console.log('getDepartments');
    const departments = await departmentService.getDepartments();
    res.success(departments, 'Departments retrieved successfully', {
      total: departments.length
    });
  }),

  getDepartment: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const department = await departmentService.getDepartment(Number(id));
    
    if (!department) {
      throw ApiError.notFound('Department not found');
    }
    
    res.success(department, 'Department retrieved successfully');
  }),

  createDepartment: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const department = await departmentService.createDepartment(req.body);
    res.created(department, 'Department created successfully');
  }),

  updateDepartment: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const department = await departmentService.updateDepartment(Number(id), req.body);
    
    if (!department) {
      throw ApiError.notFound('Department not found');
    }
    
    res.success(department, 'Department updated successfully');
  }),

  deleteDepartment: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await departmentService.deleteDepartment(Number(id));
    
    if (!result) {
      throw ApiError.notFound('Department not found');
    }
    
    res.noContent();
  })
};
