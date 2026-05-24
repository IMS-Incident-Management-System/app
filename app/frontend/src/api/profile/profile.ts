import { axiosGatewayBackend } from "../../plugins/axios";
import { useRequest } from "../../hooks/useRequest";

export interface ProfileResponse {
  keycloak: {
    sub: string;
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    preferred_username: string;
    realm_roles: string[];
  };
  profile: {
    id: number;
    external_id: string;
    auth_provider: string | null;
    patronymic: string | null;
    personnel_number: string | null;
    photo_path: string | null;
  } | null;
}

export interface UpdateProfileRequest {
  patronymic?: string | null;
  personnel_number?: string | null;
}

export const getMyProfile = async () => {
  const response = await useRequest<ProfileResponse>(async () =>
    axiosGatewayBackend.get("/profile/me")
  );

  return response;
};

export const updateMyProfile = async (data: UpdateProfileRequest) => {
  const response = await useRequest<ProfileResponse["profile"]>(async () =>
    axiosGatewayBackend.put("/profile/me", data)
  );

  return response;
};

export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await useRequest<ProfileResponse["profile"]>(async () =>
    axiosGatewayBackend.post("/profile/photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );

  return response;
};


