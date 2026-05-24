import axiosComponent, { AxiosInstance } from "axios";
import { onErrorResponse, onRequest, onResponse } from "./axios.interceptors";

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && window.location.hostname === 'localhost';

export const axiosGatewayKeycloakUrl =
  process.env.NODE_ENV === "production"
    ? (isLocalhost ? "http://localhost:8087" : (process.env.REACT_APP_PROD_URL_KEYCLOAK || "/auth"))
    : (process.env.REACT_APP_BASE_URL_KEYCLOAK || "http://localhost:8087");

// Гарантируем, что путь оканчивается на /api/v1 в прод-режиме при локальной разработке
const prodBackendUrl = process.env.REACT_APP_PROD_URL_BACKEND || "/api/v1";
export const axiosGatewayBackendUrl =
  process.env.NODE_ENV === "production"
    ? (isLocalhost ? "http://localhost:8091/api/v1" : prodBackendUrl)
    : (process.env.REACT_APP_BASE_URL_BACKEND || "http://localhost:8091/api/v1");

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