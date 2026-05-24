import { useMutation, useQueryClient } from "react-query";
import {
  createObjectType,
  updateObjectType,
  deleteObjectType,
} from "../../../api/objectTypes/objectTypes";
import { message } from "antd";

export const useCreateObjectType = () => {
  const queryClient = useQueryClient();

  return useMutation(createObjectType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllObjectTypes"]);
      message.success("Тип объекта успешно создан");
    },
    onError: () => {
      message.error("Не удалось создать тип объекта");
    },
  });
};

export const useUpdateObjectType = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: { title: string } }) =>
      updateObjectType(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllObjectTypes"]);
        message.success("Тип объекта успешно обновлен");
      },
      onError: () => {
        message.error("Не удалось обновить тип объекта");
      },
    },
  );
};

export const useDeleteObjectType = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteObjectType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllObjectTypes"]);
      message.success("Тип объекта успешно удален");
    },
    onError: () => {
      message.error("Не удалось удалить тип объекта");
    },
  });
};

