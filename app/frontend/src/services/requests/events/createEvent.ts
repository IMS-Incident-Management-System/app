import { useMutation } from "react-query";
import { createEvent } from "../../../api/events/events";
import { CreateEventBody } from "../../../interfaces/requests/event";
import { queryClient } from "../../../plugins/query";
import { useNavigate } from "react-router-dom";
import useApp from "antd/es/app/useApp";
import { ERoutes } from "../../../enums/routes";
import { EQueryKeys } from "../../../enums/query";

export const useCreateEvent = () => {
  const navigate = useNavigate();
  const app = useApp();

  const mutation = useMutation(
    (data: CreateEventBody) => createEvent(data),
    {
      onSuccess: (response: any) => {
        console.log('CreateEvent response:', response);
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_ALL_EVENTS],
        });
        app.message.success("Событие успешно создано");
        const eventData = (response as any)?.data || response;
        console.log('Extracted data:', eventData);
        if (eventData?.event?.id) {
          const eventId = eventData.event.id;
          console.log('Navigating to event:', eventId);
          queryClient.invalidateQueries({
            queryKey: [EQueryKeys.GET_EVENT, eventId.toString()],
          });
          navigate(`${ERoutes.EVENT_VIEW}/${eventId}`);
        } else {
          console.warn('No event ID in response, navigating to list');
          navigate(ERoutes.EVENTS_LIST);
        }
      },
      onError: (error) => {
        console.error('createEvent error:', error);
        app.message.error("Не удалось создать событие");
      },
    },
  );

  return mutation;
};

