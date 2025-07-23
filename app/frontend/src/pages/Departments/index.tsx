import React from 'react';
import TreeManager from '../../components/TreeStructure/TreeManager';
import { useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../services/requests/departments/mutations';
import { TreeConfig } from '../../components/TreeStructure/types';

export const Departments = () => {
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const treeConfig: TreeConfig = {
    title: 'Организационная структура',
    apiEndpoint: '/departments',
    addButtonText: 'Добавить департамент',
    editModalTitle: 'Редактировать департамент',
    deleteModalTitle: 'Удалить департамент',
    idField: 'department_id',
    addFormConfig: {
      title: 'Добавить департамент',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название департамента'
        }
      ]
    },
    editFormConfig: {
      title: 'Редактировать департамент',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название департамента'
        }
      ]
    }
  };

  return (
    <TreeManager
      config={treeConfig}
      mutations={{
        createNode: (data) => createMutation.mutateAsync(data),
        updateNode: (id, data) => updateMutation.mutateAsync({ id, data }),
        deleteNode: (id) => deleteMutation.mutateAsync(id)
      }}
    />
  );
};

export default Departments;
