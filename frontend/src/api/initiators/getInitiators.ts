import { axiosGatewayBackend } from "../../plugins/axios";

export const getInitiators = async () => {
  const response = await axiosGatewayBackend.get("/initiators");
  return response.data;
};
