import { AxiosResponse } from "axios";

/** Выполняет запрос и возвращает тело ответа. Учитывает, что response-интерцептор уже может вернуть response.data. */
export const useRequest = async <T>(
  request: () => Promise<AxiosResponse<T, any> | T>,
): Promise<T> => {
  try {
    const result = await request();
    return (result as any)?.data !== undefined ? (result as AxiosResponse<T>).data : (result as T);
  } catch (error: any) {
    throw error;
  }
};
