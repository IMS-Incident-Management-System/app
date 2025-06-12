import { axiosGatewayBackend } from "../../plugins/axios";
import { useRequest } from "../../hooks/useRequest";
import { ObjectAttributes } from "../../interfaces/requests/object";

export const getObjects = async () => {
  const response = await useRequest<ObjectAttributes[]>(async () =>
    axiosGatewayBackend.get("/objects"),
  );

  return response;
};
