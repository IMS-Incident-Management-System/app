import { useMutation, useQueryClient } from "react-query";
import {
  createIncidentEventType,
  updateIncidentEventType,
  deleteIncidentEventType,
} from "../../../api/incidentEventTypes/incidentEventTypes";
import { message } from "antd";

export const useCreateIncidentEventType = () => {
  const queryClient = useQueryClient();

  return useMutation(createIncidentEventType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllIncidentEventTypes"]);
      message.success("Тип события инцидента успешно создан");
    },
    onError: () => {
      message.error("Не удалось создать тип события инцидента");
    },
  });
};

export const useUpdateIncidentEventType = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: { title: string } }) =>
      updateIncidentEventType(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllIncidentEventTypes"]);
        message.success("Тип события инцидента успешно обновлен");
      },
      onError: () => {
        message.error("Не удалось обновить тип события инцидента");
      },
    },
  );
};

export const useDeleteIncidentEventType = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteIncidentEventType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllIncidentEventTypes"]);
      message.success("Тип события инцидента успешно удален");
    },
    onError: () => {
      message.error("Не удалось удалить тип события инцидента");
    },
  });
};


