import React from 'react';
import TreeManager from '../../components/TreeStructure/TreeManager';
import { TreeConfig, TreeMutations } from '../../components/TreeStructure/types';
import { useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../services/requests/departments/mutations';

const departmentConfig: TreeConfig = {
  apiEndpoint: '/departments',
  idField: 'department_id',
  title: 'Департаменты',
  addButtonText: 'Добавить департамент',
  editModalTitle: 'Редактировать департамент',
  deleteModalTitle: 'Удалить департамент',
};

const Departments: React.FC = () => {
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const mutations: TreeMutations = {
    createNode: async (data) => {
      const result = await createMutation.mutateAsync(data);
      return result;
    },
    updateNode: async (id, data) => {
      const result = await updateMutation.mutateAsync({ id, data });
      return result;
    },
    deleteNode: async (id) => {
      await deleteMutation.mutateAsync(id);
      return true;
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <TreeManager config={departmentConfig} mutations={mutations} />
    </div>
  );
};

export default Departments; 