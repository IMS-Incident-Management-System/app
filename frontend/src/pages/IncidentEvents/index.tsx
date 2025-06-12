import TreeManager from '../../components/TreeStructure/TreeManager';
import {
  TreeConfig,
} from "../../components/TreeStructure/types";
import {
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from "../../services/requests/eventTypes/mutations";

export const EventTypes = () => {
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();

  const treeConfig: TreeConfig = {
    title: 'Типы событий',
    apiEndpoint: '/event-types',
    addButtonText: 'Добавить тип события',
    editModalTitle: 'Редактировать тип события',
    deleteModalTitle: 'Удалить тип события',
    idField: 'event_type_id',
    addFormConfig: {
      title: 'Добавить тип события',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название типа события'
        }
      ]
    },
    editFormConfig: {
      title: 'Редактировать тип события',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название типа события'
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

export default EventTypes;
