import { axiosGatewayBackend } from "../../plugins/axios";
import { IncidentEventType } from "../../interfaces/requests/incidentEventType";
import { useRequest } from "../../hooks/useRequest";

interface CreateIncidentEventTypeData {
  title: string;
  parent_id?: number | null;
}

interface UpdateIncidentEventTypeData {
  title: string;
}

export const getIncidentEventTypes = async () => {
  const response = await useRequest<IncidentEventType>(async () =>
    axiosGatewayBackend.get("/event-types"),
  );

  return response;
};

export const createIncidentEventType = async (data: CreateIncidentEventTypeData) => {
  const response = await useRequest<IncidentEventType>(async () =>
    axiosGatewayBackend.post("/event-types", data),
  );

  return response;
};

export const updateIncidentEventType = async (id: number, data: UpdateIncidentEventTypeData) => {
  const response = await useRequest<IncidentEventType>(async () =>
    axiosGatewayBackend.put(`/event-types/${id}`, data),
  );

  return response;
};

export const deleteIncidentEventType = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/event-types/${id}`),
  );

  return response;
};


