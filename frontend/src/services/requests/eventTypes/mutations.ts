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
      message.success("Тип события успешно создан");
    },
    onError: () => {
      message.error("Не удалось создать тип события");
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
        message.success("Тип события успешно обновлен");
      },
      onError: () => {
        message.error("Не удалось обновить тип события");
      },
    },
  );
};

export const useDeleteEventType = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteEventType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllEventTypes"]);
      message.success("Тип события успешно удален");
    },
    onError: () => {
      message.error("Не удалось удалить тип события");
    },
  });
}; 