import { useMutation } from "react-query";
import { createEvent } from "../../../api/events/events";
import { message } from "antd";
import { queryClient } from "../../../plugins/query";
import { EQueryKeys } from "../../../enums/query";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";

export const useCreateEvent = (onSuccess?: () => void) => {
  const navigate = useNavigate();

  return useMutation((data: any) => createEvent(data), {
    onSuccess: (data) => {
      message.success("Событие успешно создано");
      queryClient.invalidateQueries(EQueryKeys.GET_ALL_EVENTS);
      if (onSuccess) {
        onSuccess();
      } else {
        // Перенаправляем на карточку созданного события
        if (data?.id) {
          navigate(`${ERoutes.EVENT_VIEW}/${data.id}`);
        } else {
          navigate(ERoutes.EVENTS_LIST);
        }
      }
    },
    onError: () => {
      message.error("Ошибка при создании события");
    },
  });
};

