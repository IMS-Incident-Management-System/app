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
    // Получаем все подразделения
    const departments = await DepartmentModel.findAll({
      order: [
        ['title', 'ASC']
      ]
    });

    // Создаем Map для быстрого поиска подразделений по ID
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

    // Получаем корневые подразделения
    const rootDepartments = Array.from(departmentMap.values())
      .filter(dept => !dept.parent_id);

    // Кастомная сортировка: КЦ, ЕЦКБ, Регионы (по алфавиту), ДЗК
    const customSort = (a: DepartmentTree, b: DepartmentTree) => {
      const getSortPriority = (title: string) => {
        const upperTitle = title.toUpperCase();
        
        // КЦ - приоритет 1
        if (upperTitle.includes('КЦ') || upperTitle === 'КЦ') return 1;
        
        // ЕЦКБ - приоритет 2  
        if (upperTitle.includes('ЕЦКБ') || upperTitle === 'ЕЦКБ') return 2;
        
        // ДЗК - приоритет 4 (последний)
        if (upperTitle.includes('ДЗК') || upperTitle === 'ДЗК') return 4;
        
        // Регионы - приоритет 3 (сортировка по алфавиту)
        return 3;
      };

      const priorityA = getSortPriority(a.title);
      const priorityB = getSortPriority(b.title);

      // Если приоритеты разные, сортируем по приоритету
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Если приоритеты одинаковые (оба регионы), сортируем по алфавиту
      return a.title.localeCompare(b.title, 'ru');
    };

    // Сортируем корневые подразделения
    rootDepartments.sort(customSort);

    // Рекурсивно сортируем дочерние подразделения
    const sortChildren = (dept: DepartmentTree) => {
      if (dept.children && dept.children.length > 0) {
        dept.children.sort(customSort);
        dept.children.forEach(sortChildren);
      }
    };

    rootDepartments.forEach(sortChildren);

    return rootDepartments;
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

    // Рекурсивная функция для получения всех ID дочерних подразделений
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

    // Получаем все ID дочерних подразделений
    const childrenIds = await getAllChildrenIds(id);

    // Удаляем все подразделения одним запросом
    if (childrenIds.length > 0) {
      await DepartmentModel.destroy({
        where: {
          department_id: childrenIds
        }
      });
    }

    // Удаляем само подразделение
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
