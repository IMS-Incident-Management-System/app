import { useMutation } from "react-query";
import { deleteEvent } from "../../../api/events/events";
import { message } from "antd";
import { queryClient } from "../../../plugins/query";
import { EQueryKeys } from "../../../enums/query";

export const useDeleteEvent = () => {
  return useMutation((id: number) => deleteEvent(id), {
    onSuccess: () => {
      message.success("Событие успешно удалено");
      queryClient.invalidateQueries(EQueryKeys.GET_ALL_EVENTS);
    },
    onError: () => {
      message.error("Ошибка при удалении события");
    },
  });
};

