import { useSelector } from 'react-redux';
import TreeManager from '../../components/TreeStructure/TreeManager';
import {
  TreeConfig,
} from "../../components/TreeStructure/types";
import {
  useCreateIncidentEventType,
  useUpdateIncidentEventType,
  useDeleteIncidentEventType,
} from "../../services/requests/incidentEventTypes/mutations";
import { selectCanCreateEventType, selectCanUpdateEventType, selectCanDeleteEventType } from '../../store/features/permissions/selectors';

export const EventTypes = () => {
  const createMutation = useCreateIncidentEventType();
  const updateMutation = useUpdateIncidentEventType();
  const deleteMutation = useDeleteIncidentEventType();
  const canCreate = useSelector(selectCanCreateEventType);
  const canUpdate = useSelector(selectCanUpdateEventType);
  const canDelete = useSelector(selectCanDeleteEventType);

  const treeConfig: TreeConfig = {
    title: 'Типы инцидентов',
    apiEndpoint: '/event-types',
    addButtonText: 'Добавить тип инцидента',
    editModalTitle: 'Редактировать тип инцидента',
    deleteModalTitle: 'Удалить тип инцидента',
    idField: 'event_type_id',
    canCreate,
    canUpdate,
    canDelete,
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
