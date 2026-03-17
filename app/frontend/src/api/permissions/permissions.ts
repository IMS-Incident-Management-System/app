import { axiosGatewayBackend } from "../../plugins/axios";
import { useRequest } from "../../hooks/useRequest";

export interface PermissionsResponse {
  permissions: string[];
  byEntity: Record<string, Record<string, boolean>>;
}

export const getMyPermissions = async (): Promise<PermissionsResponse> => {
  const response = await useRequest<PermissionsResponse>(() =>
    axiosGatewayBackend.get("/profile/me/permissions")
  );
  return response;
};
