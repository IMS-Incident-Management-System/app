import { axiosGatewayBackend } from "../../plugins/axios";

export interface RoleDto {
  id: number;
  name: string;
  code: string;
  description: string | null;
  permissions: string[];
}

export interface PermissionGroupsResponse {
  permissions: string[];
  groups: Record<string, { label: string; permissions: string[] }>;
}

export interface UserWithRolesDto {
  id: number;
  external_id: string;
  display_name: string | null;
  preferred_username: string | null;
  roles: { id: number; name: string; code: string }[];
}

export const getPermissionCodes = async (): Promise<PermissionGroupsResponse> => {
  const res = await axiosGatewayBackend.get<PermissionGroupsResponse>("/access/permissions", {
    params: { _: Date.now() },
  });
  return (res as unknown) as PermissionGroupsResponse;
};

export const getRoles = async (): Promise<RoleDto[]> => {
  const res = await axiosGatewayBackend.get<RoleDto[]>("/access/roles");
  return (res as unknown) as RoleDto[];
};

export const getRole = async (id: number): Promise<RoleDto> => {
  const res = await axiosGatewayBackend.get<RoleDto>(`/access/roles/${id}`);
  return (res as unknown) as RoleDto;
};

export const createRole = async (data: {
  name: string;
  code: string;
  description?: string | null;
  permissions: string[];
}): Promise<RoleDto> => {
  const res = await axiosGatewayBackend.post<RoleDto>("/access/roles", data);
  return (res as unknown) as RoleDto;
};

export const updateRole = async (
  id: number,
  data: { name?: string; code?: string; description?: string | null; permissions?: string[] }
): Promise<RoleDto> => {
  const res = await axiosGatewayBackend.put<RoleDto>(`/access/roles/${id}`, data);
  return (res as unknown) as RoleDto;
};

export const deleteRole = async (id: number): Promise<void> => {
  await axiosGatewayBackend.delete(`/access/roles/${id}`);
};

export interface GetUsersResponse {
  data: UserWithRolesDto[];
  total: number;
}

export const getUsers = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<GetUsersResponse> => {
  const requestParams: Record<string, string | number> = {};
  if (params?.search != null && params.search !== "") requestParams.search = params.search;
  if (params?.page != null) requestParams.page = params.page;
  if (params?.limit != null) requestParams.limit = params.limit;
  const res = await axiosGatewayBackend.get<GetUsersResponse>("/access/users", {
    params: Object.keys(requestParams).length ? requestParams : {},
  });
  return (res as unknown) as GetUsersResponse;
};

export const setUserRoles = async (
  externalId: string,
  roleIds: number[]
): Promise<{ external_id: string; roles: { id: number; name: string; code: string }[] }> => {
  const res = await axiosGatewayBackend.put(`/access/users/${encodeURIComponent(externalId)}/roles`, {
    role_ids: roleIds,
  });
  return (res as unknown) as { external_id: string; roles: { id: number; name: string; code: string }[] };
};
