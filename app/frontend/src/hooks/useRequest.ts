import { App } from "antd";
import { AxiosResponse } from "axios";

export const useRequest = async <T>(
  request: () => Promise<AxiosResponse<T, any>>,
) => {
  try {
    const response = await request();
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
