import { axiosGatewayBackend } from "../../plugins/axios";
import { ITable, IUseGetRequest } from "../../interfaces/common/common";
import {
  CreateOperationalActivityBody,
  CreateOperationalActivityResponse,
  OperationalActivityWithRelations,
  TOperationalActivityFilter,
} from "../../interfaces/requests/operationalActivity";
import { useRequest } from "../../hooks/useRequest";

const serializeListParam = (value?: Array<string | number>) =>
  value && value.length ? value.join(",") : undefined;

export const getOperationalActivities = async (
  filter: IUseGetRequest<TOperationalActivityFilter>,
) => {
  const { filter: activityFilter, pagination } = filter;
  const response = await useRequest<ITable<OperationalActivityWithRelations>>(async () =>
    axiosGatewayBackend.get("/operational-activities", {
      params: {
        ...activityFilter,
        department_id: serializeListParam(activityFilter.department_id),
        direction: serializeListParam(activityFilter.direction),
        ...pagination,
      },
    }),
  );

  return response;
};

export const getOperationalActivity = async (id: string) => {
  const response = await useRequest<OperationalActivityWithRelations>(async () =>
    axiosGatewayBackend.get(`/operational-activities/${id}`),
  );

  return response;
};

export const createOperationalActivity = async (data: CreateOperationalActivityBody) => {
  const response = await useRequest<CreateOperationalActivityResponse>(async () =>
    axiosGatewayBackend.post("/operational-activities", data),
  );

  return response;
};

export const updateOperationalActivity = async (
  data: CreateOperationalActivityBody,
  id: number,
) => {
  const response = await useRequest<CreateOperationalActivityResponse>(async () =>
    axiosGatewayBackend.put(`/operational-activities/${id}`, data),
  );

  return response;
};

export const deleteOperationalActivity = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/operational-activities/${id}`),
  );

  return response;
};


