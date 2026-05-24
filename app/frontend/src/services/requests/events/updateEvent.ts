import { useMutation } from "react-query";
import { updateEvent } from "../../../api/events/events";
import { CreateEventBody } from "../../../interfaces/requests/event";
import { queryClient } from "../../../plugins/query";
import useApp from "antd/es/app/useApp";
import { EQueryKeys } from "../../../enums/query";

export const useUpdateEvent = () => {
  const app = useApp();

  const mutation = useMutation(
    ({ data, id }: { data: CreateEventBody; id: number }) => updateEvent(data, id),
    {
      onSuccess: (response: any, variables) => {
        console.log('UpdateEvent response:', response);
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_ALL_EVENTS],
        });
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_EVENT, variables.id.toString()],
        });
        app.message.success("Событие успешно обновлено");
      },
      onError: (error) => {
        console.error('updateEvent error:', error);
        app.message.error("Не удалось обновить событие");
      },
    },
  );

  return mutation;
};

