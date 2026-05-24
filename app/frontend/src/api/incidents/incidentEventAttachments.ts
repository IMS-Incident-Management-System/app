import { axiosGatewayBackend } from "../../plugins/axios";
import { useRequest } from "../../hooks/useRequest";

export interface IncidentEventAttachmentAttributes {
  id: number;
  incident_event_id: number;
  filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at?: Date;
  updated_at?: Date;
}

export const getIncidentEventAttachments = async (incidentEventId: number) => {
  const response = await useRequest<IncidentEventAttachmentAttributes[]>(async () =>
    axiosGatewayBackend.get(`/incident-events/${incidentEventId}/attachments`),
  );

  return response;
};

export const uploadIncidentEventAttachments = async (
  incidentEventId: number,
  files: File[]
) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await useRequest<IncidentEventAttachmentAttributes[]>(async () =>
    axiosGatewayBackend.post(`/incident-events/${incidentEventId}/attachments`, formData),
  );

  return response;
};

export const downloadIncidentEventAttachment = async (
  incidentEventId: number,
  attachmentId: number
) => {
  const response = await axiosGatewayBackend.get(
    `/incident-events/${incidentEventId}/attachments/${attachmentId}/download`,
    {
      responseType: 'blob',
    }
  );

  return response;
};

export const deleteIncidentEventAttachment = async (
  incidentEventId: number,
  attachmentId: number
) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/incident-events/${incidentEventId}/attachments/${attachmentId}`),
  );

  return response;
};

