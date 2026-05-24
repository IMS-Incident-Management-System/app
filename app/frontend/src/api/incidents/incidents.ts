import { axiosGatewayBackend } from "../../plugins/axios";
import { ITable, IUseGetRequest } from "../../interfaces/common/common";
import {
  CreateIncidentBody,
  CreateIncidentResponse,
  IncidentWithRelations,
  TIncidentFilter,
} from "../../interfaces/requests/incident";
import { useRequest } from "../../hooks/useRequest";

export const getInitiators = async (
  filter: IUseGetRequest<TIncidentFilter>,
) => {
  const response = await useRequest<ITable<IncidentWithRelations>>(async () =>
    axiosGatewayBackend.get("/incidents", {
      params: { ...filter.filter, ...filter.pagination },
    }),
  );

  return response;
};

export const getIncident = async (id: string) => {
  const response = await useRequest<IncidentWithRelations>(async () =>
    axiosGatewayBackend.get(`/incidents/${id}`),
  );

  return response;
};

export const createIncident = async (data: CreateIncidentBody) => {
  const response = await useRequest<CreateIncidentResponse>(async () =>
    axiosGatewayBackend.post("/incidents", data),
  );

  return response;
};

export const updateIncident = async (
  data: CreateIncidentBody,
  id: number,
) => {
  const response = await useRequest<CreateIncidentResponse>(async () =>
    axiosGatewayBackend.put(`/incidents/${id}`, data),
  );

  return response;
};

export const deleteIncident = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/incidents/${id}`),
  );

  return response;
};
