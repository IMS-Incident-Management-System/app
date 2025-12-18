import { useMutation } from "react-query";
import { deleteEvent } from "../../../api/events/events";
import { queryClient } from "../../../plugins/query";
import useApp from "antd/es/app/useApp";
import { EQueryKeys } from "../../../enums/query";

export const useDeleteEvent = () => {
  const app = useApp();

  const mutation = useMutation(
    (id: number) => deleteEvent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_ALL_EVENTS],
        });
        app.message.success("Событие успешно удалено");
      },
      onError: (error) => {
        console.error('deleteEvent error:', error);
        app.message.error("Не удалось удалить событие");
      },
    },
  );

  return mutation;
};

