import axiosComponent, { AxiosInstance } from "axios";
import { onErrorResponse, onRequest, onResponse } from "./axios.interceptors";

export const axiosGatewayKeycloakUrl =
  process?.env?.baseURLKeycloak ?? "http://localhost:8091/api/keycloak";
export const axiosGatewayBackendUrl =
  process?.env?.baseURLBackend ?? "http://localhost:8091/api/v1";

export const setupInterceptors = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(onRequest, onErrorResponse);
  instance.interceptors.response.use(onResponse, onErrorResponse);

  return instance;
};

export const axiosGatewayKeycloak = axiosComponent.create({
  baseURL: axiosGatewayKeycloakUrl,
});

export const axiosGatewayBackend = axiosComponent.create({
  baseURL: axiosGatewayBackendUrl,
});

setupInterceptors(axiosGatewayKeycloak);
setupInterceptors(axiosGatewayBackend);