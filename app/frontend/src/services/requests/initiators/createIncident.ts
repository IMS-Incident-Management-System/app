import { useMutation } from "react-query";
import { createIncident } from "../../../api/incidents/incidents";
import { CreateIncidentBody } from "../../../interfaces/requests/incident";
import { queryClient } from "../../../plugins/query";
import { useNavigate } from "react-router-dom";
import useApp from "antd/es/app/useApp";
import { ERoutes } from "../../../enums/routes";
import { EQueryKeys } from "../../../enums/query";

export const useCreateIncident = (setStep?: (step: number) => void) => {
  const navigate = useNavigate();
  const app = useApp();

  const mutation = useMutation(
    (data: CreateIncidentBody) => createIncident(data),
    {
      onSuccess: (response: any) => {
        console.log('CreateIncident response:', response);
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_ALL_INITIATORS],
        });
        app.message.success("Инцидент успешно создан");
        // Перенаправляем на карточку созданного инцидента
        // Ответ обернут в структуру { success: true, data: {...}, message: "..." }
        // useRequest возвращает response.data, который уже является { success: true, data: CreateIncidentResponse, message: "..." }
        const incidentData = (response as any)?.data || response;
        console.log('Extracted data:', incidentData);
        if (incidentData?.incident?.id) {
          const incidentId = incidentData.incident.id;
          console.log('Navigating to incident:', incidentId);
          // Инвалидируем кеш для этого инцидента перед навигацией
          queryClient.invalidateQueries({
            queryKey: ["getIncident", incidentId.toString()],
          });
          navigate(`${ERoutes.INCIDENT_VIEW}/${incidentId}`);
        } else {
          console.warn('No incident ID in response, navigating to list');
          navigate(ERoutes.INCIDENTS_LIST);
        }
      },
      onError: (error) => {
        console.error('createIncident error:', error);
        app.message.error("Не удалось создать инцидент");
      },
    },
  );

  return mutation;
};
