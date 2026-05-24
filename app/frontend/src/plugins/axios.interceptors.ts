import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import AuthService from "../services/auth.service";

// Request Interceptor
export const onRequest = async (
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  const authService = AuthService.getInstance();
  const token = await authService.refreshTokenIfNeeded();

  if (token && config.headers) {
    config.headers.authorization = `Bearer ${token}`;
  } else {
    return Promise.reject(new Error("No token provided. Please log in."));
  }

  return config;
};

export const onResponse = (response: any) => {
  const { method, url } = response.config;
  const { status } = response;

  // Если это blob ответ, возвращаем весь response объект, а не только data
  if (response.config.responseType === 'blob' || response.data instanceof Blob) {
    return response;
  }

  return response.data;
};

export const onErrorResponse = async (
  error: AxiosError | Error,
): Promise<AxiosError> => {
  if (axios.isAxiosError(error)) {
    const { response, config } = error;

    if (response?.status === 401 && config) {
      try {
        const authService = AuthService.getInstance();

        // Попытка обновить токен
        const refreshedToken = await authService.refreshTokenIfNeeded();
        if (refreshedToken) {
          // Повторяем запрос с обновленным токеном
          const newConfig: AxiosRequestConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${refreshedToken}`,
            },
          };
          return axios(newConfig);
        } else {
          // Токен обновить не удалось, перенаправляем на логин
          console.error("Token refresh failed. Redirecting to login...");
          const keycloak = authService.getKeycloakInstance();
          if (keycloak) {
            keycloak.login({
              redirectUri: window.location.href, // Возврат на текущую страницу после логина
            });
          }
        }
      } catch (refreshError) {
        console.error("Error during token refresh:", refreshError);
      }
    }

    // Если статус не 401 или обновление не удалось
    return Promise.reject(error.response?.data || error.message);
  } else {
    // Обработка других типов ошибок
    console.error("Unexpected error:", error);
    return Promise.reject(error);
  }
};
