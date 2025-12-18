import { axiosGatewayBackend } from "../../plugins/axios";
import { ITable, IUseGetRequest } from "../../interfaces/common/common";
import {
  CreateEventBody,
  CreateEventResponse,
  EventWithRelations,
  TEventFilter,
} from "../../interfaces/requests/event";
import { useRequest } from "../../hooks/useRequest";

export const getEvents = async (
  filter: IUseGetRequest<TEventFilter>,
) => {
  const response = await useRequest<ITable<EventWithRelations>>(async () =>
    axiosGatewayBackend.get("/events", {
      params: { ...filter.filter, ...filter.pagination },
    }),
  );

  return response;
};

export const getEvent = async (id: string) => {
  const response = await useRequest<EventWithRelations>(async () =>
    axiosGatewayBackend.get(`/events/${id}`),
  );

  return response;
};

export const createEvent = async (data: CreateEventBody) => {
  const response = await useRequest<CreateEventResponse>(async () =>
    axiosGatewayBackend.post("/events", data),
  );

  return response;
};

export const updateEvent = async (
  data: CreateEventBody,
  id: number,
) => {
  const response = await useRequest<CreateEventResponse>(async () =>
    axiosGatewayBackend.put(`/events/${id}`, data),
  );

  return response;
};

export const deleteEvent = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/events/${id}`),
  );

  return response;
};

