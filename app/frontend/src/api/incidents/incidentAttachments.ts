import { axiosGatewayBackend } from "../../plugins/axios";
import { useRequest } from "../../hooks/useRequest";
import { IncidentAttachmentAttributes } from "../../interfaces/requests/incident";

export const getIncidentAttachments = async (incidentId: number) => {
  const response = await useRequest<IncidentAttachmentAttributes[]>(async () =>
    axiosGatewayBackend.get(`/incidents/${incidentId}/attachments`),
  );

  return response;
};

export const uploadIncidentAttachments = async (
  incidentId: number,
  files: File[]
) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await useRequest<IncidentAttachmentAttributes[]>(async () =>
    axiosGatewayBackend.post(`/incidents/${incidentId}/attachments`, formData),
  );

  return response;
};

export const downloadIncidentAttachment = async (
  incidentId: number,
  attachmentId: number
) => {
  const response = await axiosGatewayBackend.get(
    `/incidents/${incidentId}/attachments/${attachmentId}/download`,
    {
      responseType: 'blob',
    }
  );

  return response;
};

export const deleteIncidentAttachment = async (
  incidentId: number,
  attachmentId: number
) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/incidents/${incidentId}/attachments/${attachmentId}`),
  );

  return response;
};

