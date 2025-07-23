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
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_ALL_INITIATORS],
        });
      },
      onError: (error) => {
        console.error(error);
        app.message.error("Не удалось создать инцидент");
      },
    },
  );

  return mutation;
};
