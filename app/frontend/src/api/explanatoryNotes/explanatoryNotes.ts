import { axiosGatewayBackend } from "../../plugins/axios";
import { ITable, IUseGetRequest } from "../../interfaces/common/common";
import { useRequest } from "../../hooks/useRequest";

export interface ExplanatoryNote {
  id: number;
  number?: number;
  kc_r?: string;
  p?: string;
  period_from: string;
  period_to: string;
  entry_date: string;
  event_info?: string;
  service_investigation_count?: number;
  service_check_ib_count?: number;
  verification_activity_count?: number;
  punished_count?: number;
  dismissed_count?: number;
  materials_transferred_count?: number;
  cases_initiated_count?: number;
  detected_damage?: number;
  recovered_damage?: number;
  recovered_receivables?: number;
  prevented_damage?: number;
  reduced_cost?: number;
  prevented_writeoff_receivables?: number;
  additional_income?: number;
  vat_deducted?: number;
  department_id?: number;
  department?: {
    department_id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ExplanatoryNoteFilter {
  department_id?: number;
  period_from?: string;
  period_to?: string;
  entry_date_from?: string;
  entry_date_to?: string;
}

export const getExplanatoryNotes = async (
  filter: IUseGetRequest<ExplanatoryNoteFilter>,
) => {
  const response = await useRequest<ITable<ExplanatoryNote>>(async () =>
    axiosGatewayBackend.get("/explanatory-notes", {
      params: { ...filter.filter, ...filter.pagination },
    }),
  );

  return response;
};

export const getExplanatoryNote = async (id: string) => {
  const response = await useRequest<ExplanatoryNote>(async () =>
    axiosGatewayBackend.get(`/explanatory-notes/${id}`),
  );

  return response;
};

export const createExplanatoryNote = async (data: Partial<ExplanatoryNote>) => {
  const response = await useRequest<ExplanatoryNote>(async () =>
    axiosGatewayBackend.post("/explanatory-notes", data),
  );

  return response;
};

export const updateExplanatoryNote = async (
  data: Partial<ExplanatoryNote>,
  id: number,
) => {
  const response = await useRequest<ExplanatoryNote>(async () =>
    axiosGatewayBackend.put(`/explanatory-notes/${id}`, data),
  );

  return response;
};

export const deleteExplanatoryNote = async (id: number) => {
  const response = await useRequest<void>(async () =>
    axiosGatewayBackend.delete(`/explanatory-notes/${id}`),
  );

  return response;
};
