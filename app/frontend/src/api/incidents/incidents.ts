import { axiosGatewayBackend } from "../../plugins/axios";
import { ITable, IUseGetRequest } from "../../interfaces/common/common";
import {
  CreateIncidentBody,
  CreateIncidentResponse,
  IncidentWithRelations,
  TIncidentFilter,
} from "../../interfaces/requests/incident";
import { useRequest } from "../../hooks/useRequest";

const serializeListParam = (value?: Array<string | number>) =>
  value && value.length ? value.join(",") : undefined;

export const getInitiators = async (
  filter: IUseGetRequest<TIncidentFilter>,
) => {
  const { filter: incidentFilter, pagination } = filter;
  const response = await useRequest<ITable<IncidentWithRelations>>(async () =>
    axiosGatewayBackend.get("/incidents", {
      params: {
        ...incidentFilter,
        department_id: serializeListParam(incidentFilter.department_id),
        direction: serializeListParam(incidentFilter.direction),
        object_type_id: serializeListParam(incidentFilter.object_type_id),
        event_type_id: serializeListParam(incidentFilter.event_type_id),
        ...pagination,
      },
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

export const patchIncident = async (
  id: number,
  data: { is_sent_1db: boolean },
) => {
  const response = await useRequest<IncidentWithRelations>(async () =>
    axiosGatewayBackend.patch(`/incidents/${id}`, data),
  );

  return response;
};

export const deleteIncident = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/incidents/${id}`),
  );

  return response;
};
