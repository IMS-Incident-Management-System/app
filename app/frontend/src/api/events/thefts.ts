import { axiosGatewayBackend } from "../../plugins/axios";
import { DepartmentModelType } from "../../interfaces/requests/department";
import { useRequest } from "../../hooks/useRequest";
import { TheftTypeAttributes } from "../../interfaces/requests/theft";

export const getThefts = async () => {
  const response = await useRequest<TheftTypeAttributes[]>(async () =>
    axiosGatewayBackend.get("/thefts"),
  );

  return response;
};
