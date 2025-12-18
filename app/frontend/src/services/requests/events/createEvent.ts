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
      console.log('Event created successfully:', data);
      message.success("Событие успешно создано");
      queryClient.invalidateQueries(EQueryKeys.GET_ALL_EVENTS);
      if (onSuccess) {
        console.log('Using onSuccess callback');
        onSuccess();
      } else {
        // Перенаправляем на карточку созданного события (поддержка разных форматов ответа)
        const createdId =
          // вариант { event: { id } }
          (data as any)?.event?.id ??
          // вариант { id }
          (data as any)?.id ??
          // вариант { data: { id } }
          (data as any)?.data?.id;

        if (createdId) {
          const target = `${ERoutes.EVENT_VIEW}/${createdId}`;
          console.log('Redirecting to event view:', target);
          navigate(target);
        } else {
          console.log('No event ID found, redirecting to events list');
          navigate(ERoutes.EVENTS_LIST);
        }
      }
    },
    onError: () => {
      message.error("Ошибка при создании события");
    },
  });
};

