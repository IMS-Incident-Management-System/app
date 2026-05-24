import { useMutation } from "react-query";
import { updateIncident } from "../../../api/incidents/incidents";
import { CreateIncidentBody } from "../../../interfaces/requests/incident";
import { queryClient } from "../../../plugins/query";
import useApp from "antd/es/app/useApp";
import { EQueryKeys } from "../../../enums/query";

export const useUpdateIncident = () => {
  const app = useApp();

  const mutation = useMutation(
    ({data, id}: {data: CreateIncidentBody, id: number}) => updateIncident(data, id),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_ALL_INITIATORS],
        });
        // Также инвалидируем конкретный инцидент
        queryClient.invalidateQueries({
          queryKey: ["getIncident", variables.id.toString()],
        });
        app.message.success("Инцидент успешно обновлен");
      },
      onError: (error) => {
        console.error('updateIncident error:', error);
        app.message.error("Не удалось обновить инцидент");
      },
    },
  );

  return mutation;
};
