import axiosComponent, { AxiosInstance } from "axios";
import { onErrorResponse, onRequest, onResponse } from "./axios.interceptors";

export const axiosGatewayKeycloakUrl =
  process.env.REACT_APP_BASE_URL_KEYCLOAK ?? "http://localhost:8087";
export const axiosGatewayBackendUrl =
  process.env.REACT_APP_BASE_URL_BACKEND ?? "http://localhost/api";

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