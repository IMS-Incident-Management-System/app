import DepartmentModel, { DepartmentModelType } from '../models/department';

export const departmentService = {
  getDepartments: async () => {
    const departments = await DepartmentModel.findAll({
      include: [
        {
          model: DepartmentModel,
          as: 'children',
        },
      ],
    });
    return departments;
  },

  getDepartment: async (id: number) => {
    const department = await DepartmentModel.findByPk(id, {
      include: [
        {
          model: DepartmentModel,
          as: 'children',
        },
      ],
    });
    return department;
  },

  createDepartment: async (data: Partial<DepartmentModelType>) => {
    const department = await DepartmentModel.create(data);
    return department;
  },

  updateDepartment: async (id: number, data: Partial<DepartmentModelType>) => {
    const department = await DepartmentModel.findByPk(id);
    if (!department) throw new Error('Department not found');

    await department.update({
      ...data,
    });
    return department;
  },

  deleteDepartment: async (id: number) => {
    const department = await DepartmentModel.findByPk(id);
    if (!department) throw new Error('Department not found');

    await department.destroy();
    return true;
  },

  getChildDepartments: async (parentId: number) => {
    const departments = await DepartmentModel.findAll({
      where: { parent_id: parentId },
    });
    return departments;
  },
};
