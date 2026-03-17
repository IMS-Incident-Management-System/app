import React from 'react';
import { useSelector } from 'react-redux';
import TreeManager from '../../components/TreeStructure/TreeManager';
import { useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../services/requests/departments/mutations';
import { TreeConfig } from '../../components/TreeStructure/types';
import { selectCanCreateDepartment, selectCanUpdateDepartment, selectCanDeleteDepartment } from '../../store/features/permissions/selectors';

export const Departments = () => {
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();
  const canCreate = useSelector(selectCanCreateDepartment);
  const canUpdate = useSelector(selectCanUpdateDepartment);
  const canDelete = useSelector(selectCanDeleteDepartment);

  const treeConfig: TreeConfig = {
    title: 'Организационная структура',
    apiEndpoint: '/departments',
    addButtonText: 'Добавить подразделение',
    editModalTitle: 'Редактировать подразделение',
    deleteModalTitle: 'Удалить подразделение',
    idField: 'department_id',
    canCreate,
    canUpdate,
    canDelete,
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
