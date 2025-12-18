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
    title: 'Типы инцидентов',
    apiEndpoint: '/event-types',
    addButtonText: 'Добавить тип инцидента',
    editModalTitle: 'Редактировать тип инцидента',
    deleteModalTitle: 'Удалить тип инцидента',
    idField: 'event_type_id',
    addFormConfig: {
      title: 'Добавить тип инцидента',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название типа инцидента'
        }
      ]
    },
    editFormConfig: {
      title: 'Редактировать тип инцидента',
      fields: [
        {
          name: 'title',
          label: 'Название',
          type: 'input',
          rules: [{ required: true, message: 'Пожалуйста, введите название' }],
          placeholder: 'Введите название типа инцидента'
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
