import { axiosGatewayBackend } from "../../plugins/axios";
import { DepartmentModelType } from "../../interfaces/requests/department";
import { useRequest } from "../../hooks/useRequest";

interface CreateDepartmentData {
  title: string;
  parent_id?: number | null;
}

interface UpdateDepartmentData {
  title: string;
}

export const getDepartments = async () => {
  const response = await useRequest<DepartmentModelType>(async () =>
    axiosGatewayBackend.get("/departments"),
  );

  return response;
};

export const createDepartment = async (data: CreateDepartmentData) => {
  const response = await useRequest<DepartmentModelType>(async () =>
    axiosGatewayBackend.post("/departments", data),
  );

  return response;
};

export const updateDepartment = async (id: number, data: UpdateDepartmentData) => {
  const response = await useRequest<DepartmentModelType>(async () =>
    axiosGatewayBackend.put(`/departments/${id}`, data),
  );

  return response;
};

export const deleteDepartment = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/departments/${id}`),
  );

  return response;
};
