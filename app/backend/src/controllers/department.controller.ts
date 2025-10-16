import { Request } from 'express';
import { departmentService } from '../services/department.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { DepartmentModelType } from '../models/department';

export const departmentController = {
  getDepartments: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const departments = await departmentService.getDepartments();

    const transformToTreeData = (department: any) => ({
      department_id: department.department_id,
      key: String(department.department_id),
      value: department.department_id,
      title: department.title,
      children: department.children?.map(transformToTreeData) || []
    });

    // Only get root departments (those without parent_id)
    const rootDepartments = departments.filter(dept => !dept.parent_id);
    const treeData = rootDepartments.map(transformToTreeData);

    res.success(
      { 
        treeData,
        total: departments.length 
      }, 
      'Departments retrieved successfully'
    );
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
