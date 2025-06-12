import { axiosGatewayBackend } from "../../plugins/axios";
import { EventType } from "../../interfaces/requests/eventType";
import { useRequest } from "../../hooks/useRequest";

interface CreateEventTypeData {
  title: string;
  parent_id?: number | null;
}

interface UpdateEventTypeData {
  title: string;
}

export const getEventTypes = async () => {
  const response = await useRequest<EventType>(async () =>
    axiosGatewayBackend.get("/event-types"),
  );

  return response;
};

export const createEventType = async (data: CreateEventTypeData) => {
  const response = await useRequest<EventType>(async () =>
    axiosGatewayBackend.post("/event-types", data),
  );

  return response;
};

export const updateEventType = async (id: number, data: UpdateEventTypeData) => {
  const response = await useRequest<EventType>(async () =>
    axiosGatewayBackend.put(`/event-types/${id}`, data),
  );

  return response;
};

export const deleteEventType = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/event-types/${id}`),
  );

  return response;
};
