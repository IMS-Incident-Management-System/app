import { useSelector } from 'react-redux';
import TreeManager from '../../components/TreeStructure/TreeManager';
import {
  TreeConfig,
} from "../../components/TreeStructure/types";
import {
  useCreateObjectType,
  useUpdateObjectType,
  useDeleteObjectType,
} from "../../services/requests/objectTypes/mutations";
import { selectCanCreateObjectType, selectCanUpdateObjectType, selectCanDeleteObjectType } from '../../store/features/permissions/selectors';

export const ObjectTypes = () => {
  const createMutation = useCreateObjectType();
  const updateMutation = useUpdateObjectType();
  const deleteMutation = useDeleteObjectType();
  const canCreate = useSelector(selectCanCreateObjectType);
  const canUpdate = useSelector(selectCanUpdateObjectType);
  const canDelete = useSelector(selectCanDeleteObjectType);

  const treeConfig: TreeConfig = {
    title: 'Типы объектов',
    apiEndpoint: '/object-types',
    addButtonText: 'Добавить тип объекта',
    editModalTitle: 'Редактировать тип объекта',
    deleteModalTitle: 'Удалить тип объекта',
    idField: 'object_type_id',
    canCreate,
    canUpdate,
    canDelete,
    addFormConfig: {
      title: 'Добавить тип объекта',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название типа объекта'
        }
      ]
    },
    editFormConfig: {
      title: 'Редактировать тип объекта',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название типа объекта'
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

export default ObjectTypes;

