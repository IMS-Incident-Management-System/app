import { axiosGatewayBackend } from "../../plugins/axios";
import { ObjectTypeModelType } from "../../interfaces/requests/objectType";
import { useRequest } from "../../hooks/useRequest";

interface CreateObjectTypeData {
  title: string;
  parent_id?: number | null;
}

interface UpdateObjectTypeData {
  title: string;
}

export const getObjectTypes = async () => {
  const response = await useRequest<ObjectTypeModelType>(async () =>
    axiosGatewayBackend.get("/object-types"),
  );

  return response;
};

export const createObjectType = async (data: CreateObjectTypeData) => {
  const response = await useRequest<ObjectTypeModelType>(async () =>
    axiosGatewayBackend.post("/object-types", data),
  );

  return response;
};

export const updateObjectType = async (id: number, data: UpdateObjectTypeData) => {
  const response = await useRequest<ObjectTypeModelType>(async () =>
    axiosGatewayBackend.put(`/object-types/${id}`, data),
  );

  return response;
};

export const deleteObjectType = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/object-types/${id}`),
  );

  return response;
};

