import { useMutation } from "react-query";
import { createIncident } from "../../../api/incidents/incidents";
import { CreateIncidentBody } from "../../../interfaces/requests/incident";
import { queryClient } from "../../../plugins/query";
import { useNavigate } from "react-router-dom";
import useApp from "antd/es/app/useApp";
import { ERoutes } from "../../../enums/routes";
import { EQueryKeys } from "../../../enums/query";

export const useCreateIncident = (setStep: (step: number) => void) => {
  const navigate = useNavigate();
  const app = useApp();

  const mutation = useMutation(
    (data: CreateIncidentBody) => createIncident(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_ALL_INITIATORS],
        });
        navigate(`${ERoutes.INCIDENT_CREATE}/${data.incident.id}`);
        setStep(0);
      },
      onError: (error) => {
        console.error(error);
        app.message.error("Не удалось создать инцидент");
      },
    },
  );

  return mutation;
};
