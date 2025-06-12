import DepartmentModel, { DepartmentModelType } from '../models/department';

interface DepartmentTree extends DepartmentModelType {
  children: DepartmentTree[];
}

interface CreateDepartmentData {
  title: string;
  parent_id?: number | null;
}

interface UpdateDepartmentData {
  title: string;
}

export const departmentService = {
  getDepartments: async () => {
    // Получаем все департаменты
    const departments = await DepartmentModel.findAll({
      order: [
        ['title', 'ASC']
      ]
    });

    // Создаем Map для быстрого поиска департаментов по ID
    const departmentMap = new Map<number, DepartmentTree>();
    
    // Инициализируем Map
    departments.forEach(dept => {
      const deptData = dept.toJSON() as DepartmentModelType;
      departmentMap.set(deptData.department_id, { ...deptData, children: [] });
    });

    // Строим дерево
    departments.forEach(dept => {
      const deptData = dept.toJSON() as DepartmentModelType;
      if (deptData.parent_id && departmentMap.has(deptData.parent_id)) {
        const parent = departmentMap.get(deptData.parent_id);
        if (parent) {
          const child = departmentMap.get(deptData.department_id);
          if (child) {
            parent.children.push(child);
          }
        }
      }
    });

    // Возвращаем только корневые департаменты
    return Array.from(departmentMap.values())
      .filter(dept => !dept.parent_id);
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

  createDepartment: async (data: CreateDepartmentData) => {
    const department = await DepartmentModel.create({
      title: data.title,
      parent_id: data.parent_id || null
    });
    return department;
  },

  updateDepartment: async (id: number, data: UpdateDepartmentData) => {
    const department = await DepartmentModel.findByPk(id);
    if (!department) throw new Error('Department not found');

    await department.update({
      title: data.title
    });
    return department;
  },

  deleteDepartment: async (id: number) => {
    const department = await DepartmentModel.findByPk(id);
    if (!department) throw new Error('Department not found');

    // Рекурсивная функция для получения всех ID дочерних департаментов
    const getAllChildrenIds = async (parentId: number): Promise<number[]> => {
      const children = await DepartmentModel.findAll({
        where: { parent_id: parentId }
      });

      const childrenIds = children.map(child => child.department_id);
      const descendantIds = await Promise.all(
        childrenIds.map(childId => getAllChildrenIds(childId))
      );

      return [
        ...childrenIds,
        ...descendantIds.flat()
      ];
    };

    // Получаем все ID дочерних департаментов
    const childrenIds = await getAllChildrenIds(id);

    // Удаляем все департаменты одним запросом
    if (childrenIds.length > 0) {
      await DepartmentModel.destroy({
        where: {
          department_id: childrenIds
        }
      });
    }

    // Удаляем сам департамент
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
