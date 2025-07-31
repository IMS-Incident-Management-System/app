import axiosComponent, { AxiosInstance } from "axios";
import { onErrorResponse, onRequest, onResponse } from "./axios.interceptors";

export const axiosGatewayKeycloakUrl =
  process.env.NODE_ENV === "production" ? process.env.REACT_APP_PROD_URL_KEYCLOAK : process.env.baseURLKeycloakFE;
export const axiosGatewayBackendUrl = process.env.NODE_ENV === "production" ? process.env.REACT_APP_PROD_URL_BACKEND : process.env.REACT_APP_BASE_URL_BACKEND;

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