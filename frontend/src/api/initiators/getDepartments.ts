import { axiosGatewayBackend } from "../../plugins/axios";
import { DepartmentModelType } from "../../interfaces/requests/department";
import { useRequest } from "../../hooks/useRequest";

export const getDepartments = async () => {
  const response = await useRequest<DepartmentModelType[]>(async () =>
    axiosGatewayBackend.get("/departments"),
  );

  return response;
};
