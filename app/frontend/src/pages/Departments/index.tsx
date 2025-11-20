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
    addButtonText: 'Добавить подразделение',
    editModalTitle: 'Редактировать подразделение',
    deleteModalTitle: 'Удалить подразделение',
    idField: 'department_id',
    addFormConfig: {
      title: 'Добавить подразделение',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название подразделения'
        }
      ]
    },
    editFormConfig: {
      title: 'Редактировать подразделение',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название подразделения'
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
