import { axiosGatewayBackend } from "../../plugins/axios";
import { ITable, IUseGetRequest } from "../../interfaces/common/common";
import {
  CreateEventBody,
  CreateEventResponse,
  EventWithRelations,
  TEventFilter,
} from "../../interfaces/requests/event";
import { useRequest } from "../../hooks/useRequest";

const serializeListParam = (value?: Array<string | number>) =>
  value && value.length ? value.join(",") : undefined;

export const getEvents = async (
  filter: IUseGetRequest<TEventFilter>,
) => {
  const { filter: eventFilter, pagination } = filter;
  const response = await useRequest<ITable<EventWithRelations>>(async () =>
    axiosGatewayBackend.get("/events", {
      params: {
        ...eventFilter,
        department_id: serializeListParam(eventFilter.department_id),
        ...pagination,
      },
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

