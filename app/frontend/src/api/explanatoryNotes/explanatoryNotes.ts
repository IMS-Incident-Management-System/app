import { axiosGatewayBackend } from "../../plugins/axios";
import { ITable, IUseGetRequest } from "../../interfaces/common/common";
import { useRequest } from "../../hooks/useRequest";

/** Строка реестра пояснительной записки (из инцидентов, событий, дополнений) */
export interface ExplanatoryNoteRegisterRow {
  id: number;
  number?: number;
  type: 'incident' | 'event' | 'additionally';
  typeLabel: string;
  /** Тип инцидента (ИБ, ЭБ, БПиО) — только для инцидентов */
  incident_type: string;
  display_id: string;
  kc_r: string;
  p: string;
  period_from: string;
  period_to: string;
  period?: string;
  entry_date: string;
  event_info?: string;
  service_investigation_count: number;
  service_check_count: number;
  service_check_ib_count: number;
  verification_activity_count: number;
  punished_count: number;
  dismissed_count: number;
  materials_transferred_count: number;
  cases_initiated_count: number;
  detected_damage: number;
  recovered_damage: number;
  recovered_receivables: number;
  prevented_damage: number;
  reduced_cost: number;
  prevented_writeoff_receivables: number;
  additional_income: number;
  vat_deducted: number;
  source_id?: number;
}

/** @deprecated Используйте ExplanatoryNoteRegisterRow. Старый формат для обратной совместимости. */
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
  kc_r?: string[];
  p?: string[];
  type?: ('incident' | 'event' | 'additionally')[];
  incident_type?: string[];
}

export interface ExplanatoryNoteFilterOptions {
  kc_r: string[];
  p: string[];
  type: ('incident' | 'event' | 'additionally')[];
  incident_type: string[];
}

export const getExplanatoryNotes = async (
  filter: IUseGetRequest<ExplanatoryNoteFilter>,
) => {
  const response = await useRequest<ITable<ExplanatoryNoteRegisterRow>>(async () =>
    axiosGatewayBackend.get("/explanatory-notes", {
      params: { ...filter.filter, ...filter.pagination },
    }),
  );

  return response;
};

/** Выгрузка реестра пояснительной записки в Excel */
export const exportExplanatoryNotesToExcel = async (filter: ExplanatoryNoteFilter) => {
  const response = await axiosGatewayBackend.get("/explanatory-notes/export", {
    params: filter,
    responseType: "blob",
  });

  let blob: Blob;
  if (response instanceof Blob) {
    blob = response;
  } else if (response?.data instanceof Blob) {
    blob = response.data;
  } else {
    blob = new Blob([response?.data ?? response], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const headers = (response as any)?.headers ?? {};
  const contentDisposition = headers["content-disposition"] ?? headers["Content-Disposition"];
  let fileName = "Пояснительная_записка.xlsx";
  if (contentDisposition) {
    const m = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (m?.[1]) fileName = decodeURIComponent(m[1].replace(/['"]/g, ""));
  }

  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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
