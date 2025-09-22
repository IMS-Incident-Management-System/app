import { useMutation, useQueryClient } from "react-query";
import {
  createEventType,
  updateEventType,
  deleteEventType,
} from "../../../api/eventTypes/eventTypes";
import { message } from "antd";

export const useCreateEventType = () => {
  const queryClient = useQueryClient();

  return useMutation(createEventType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllEventTypes"]);
      message.success("Тип инцидента успешно создан");
    },
    onError: () => {
      message.error("Не удалось создать тип инцидента");
    },
  });
};

export const useUpdateEventType = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: { title: string } }) =>
      updateEventType(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllEventTypes"]);
        message.success("Тип инцидента успешно обновлен");
      },
      onError: () => {
        message.error("Не удалось обновить тип инцидента");
      },
    },
  );
};

export const useDeleteEventType = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteEventType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllEventTypes"]);
      message.success("Тип инцидента успешно удален");
    },
    onError: () => {
      message.error("Не удалось удалить тип инцидента");
    },
  });
}; 