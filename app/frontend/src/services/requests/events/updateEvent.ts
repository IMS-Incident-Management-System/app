import { useMutation } from "react-query";
import { updateEvent } from "../../../api/events/events";
import { message } from "antd";
import { queryClient } from "../../../plugins/query";
import { EQueryKeys } from "../../../enums/query";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";

export const useUpdateEvent = () => {
  const navigate = useNavigate();

  return useMutation(
    ({ data, id }: { data: any; id: number }) => updateEvent(data, id),
    {
      onSuccess: () => {
        message.success("Событие успешно обновлено");
        queryClient.invalidateQueries(EQueryKeys.GET_ALL_EVENTS);
        navigate(ERoutes.EVENTS_LIST);
      },
      onError: () => {
        message.error("Ошибка при обновлении события");
      },
    }
  );
};

