import { useMutation, useQueryClient } from "react-query";
import { createDepartment, updateDepartment, deleteDepartment } from "../../../api/departments/departments";
import { message } from "antd";

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation(createDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllDepartments"]);
      message.success("Департамент успешно создан");
    },
    onError: () => {
      message.error("Не удалось создать департамент");
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: { title: string } }) =>
      updateDepartment(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllDepartments"]);
        message.success("Департамент успешно обновлен");
      },
      onError: () => {
        message.error("Не удалось обновить департамент");
      },
    },
  );
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllDepartments"]);
      message.success("Департамент успешно удален");
    },
    onError: () => {
      message.error("Не удалось удалить департамент");
    },
  });
}; 