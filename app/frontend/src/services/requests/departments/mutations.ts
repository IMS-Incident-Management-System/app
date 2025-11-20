import { useMutation, useQueryClient } from "react-query";
import { createDepartment, updateDepartment, deleteDepartment } from "../../../api/departments/departments";
import { message } from "antd";

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation(createDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllDepartments"]);
      message.success("Подразделение успешно создано");
    },
    onError: () => {
      message.error("Не удалось создать подразделение");
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
        message.success("Подразделение успешно обновлено");
      },
      onError: () => {
        message.error("Не удалось обновить подразделение");
      },
    },
  );
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllDepartments"]);
      message.success("Подразделение успешно удалено");
    },
    onError: () => {
      message.error("Не удалось удалить подразделение");
    },
  });
}; 