import { axiosGatewayBackend } from "../../plugins/axios";
import { useRequest } from "../../hooks/useRequest";

export interface ReportField {
  /** Ключ поля для API (r1..r160) — используется в таблице и выгрузке */
  key?: string;
  entity?: 'incident' | 'event' | 'operationalActivity';
  field?: string;
  label: string;
  group?: string;
  groupName?: string;
  subgroup?: string;
  subgroupName?: string;
  subsubgroup?: string;
}

export interface GenerateReportRequest {
  dateFrom: string;
  dateTo: string;
  departmentIds: number[];
  fields: ReportField[];
}

export const getAvailableFields = async (): Promise<ReportField[]> => {
  const response = await useRequest<{ success: boolean; data: ReportField[]; message?: string }>(async () =>
    axiosGatewayBackend.get("/reports/fields"),
  );

  // res.success возвращает { success: true, data: [...] }
  // axios interceptor onResponse возвращает response.data (объект { success, data, message })
  // useRequest возвращает response.data, получая { success, data, message }
  // Извлекаем data из этого объекта
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as { data: ReportField[] }).data;
    if (Array.isArray(data)) {
      return data;
    }
  }
  
  // Если ответ уже массив (на случай если формат изменился)
  if (Array.isArray(response)) {
    return response as ReportField[];
  }
  
  return [];
};

export interface GetReportTableRequest {
  dateFrom: string;
  dateTo: string;
  departmentIds?: number[];
  page?: number;
  limit?: number;
  dataSource?: 'live' | 'imported';
  reportType?: string;
}

export interface ReportTableRow {
  fieldName: string;
  fieldKey: string;
  metricKey?: string;
  [key: string]: string | number | undefined;
}

/** Ячейка иерархической шапки (бэкенд) */
export interface ReportHeaderCell {
  label: string;
  span: number;
}

export interface ReportTableMeta {
  dataSource: 'live' | 'imported';
  batchId?: number;
  batchIds?: number[];
  batchCount?: number;
  fileName?: string;
  fileNames?: string[];
  uploadedAt?: string;
  reportType?: string;
  message?: string;
}

export interface ReportTableResponse {
  rows: ReportTableRow[];
  departments: Array<{ id: number; name: string }>;
  total: number;
  paoMtsDepartmentIds?: number[];
  allSelectedArePaoMts?: boolean;
  /** Иерархическая шапка таблицы: массив строк, каждая строка — массив ячеек с label и span */
  headerRows?: ReportHeaderCell[][];
  meta?: ReportTableMeta;
}

export interface ExportReportRequest {
  dateFrom: string;
  dateTo: string;
  departmentIds: number[];
  fieldKeys: string[];
  dataSource?: 'live' | 'imported';
  reportType?: string;
}

export interface ReportImportBatch {
  id: number;
  report_type: string;
  file_name: string;
  storage_path?: string | null;
  period_from: string;
  period_to: string;
  status: string;
  replaced_by_batch_id?: number | null;
  uploaded_by?: string | null;
  validation_summary?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export const getReportTableData = async (
  data: GetReportTableRequest,
  signal?: AbortSignal
): Promise<ReportTableResponse> => {
  try {
    const raw = await useRequest<ReportTableResponse | { success: boolean; data: ReportTableResponse; message?: string }>(
      async () => axiosGatewayBackend.post("/reports/table", data, { signal }),
    );

    if (!raw || typeof raw !== 'object') {
      return { rows: [], departments: [], total: 0 };
    }
    const payload = 'data' in raw && raw.data && typeof raw.data === 'object' ? raw.data : raw;
    if (payload && 'rows' in payload && Array.isArray(payload.rows)) {
      return {
        rows: payload.rows,
        departments: payload.departments ?? [],
        total: typeof payload.total === 'number' ? payload.total : 0,
        paoMtsDepartmentIds: Array.isArray(payload.paoMtsDepartmentIds) ? payload.paoMtsDepartmentIds : undefined,
        allSelectedArePaoMts: typeof payload.allSelectedArePaoMts === 'boolean' ? payload.allSelectedArePaoMts : undefined,
        headerRows: Array.isArray(payload.headerRows) ? payload.headerRows : undefined,
        meta: payload.meta && typeof payload.meta === 'object' ? payload.meta as ReportTableMeta : undefined,
      };
    }
    return { rows: [], departments: [], total: 0 };
  } catch (error: any) {
    // Проверяем различные типы ошибок отмены
    const isAbortError = 
      error?.name === 'AbortError' || 
      error?.name === 'CanceledError' || 
      error?.code === 'ERR_CANCELED' ||
      error?.message?.includes('aborted') || 
      error?.message?.includes('canceled') ||
      (error?.response?.status === 499);
    
    if (isAbortError) {
      // Создаем специальную ошибку отмены, которую React Query может правильно обработать
      const abortError = new Error('Request was cancelled');
      abortError.name = 'AbortError';
      throw abortError;
    }
    throw error;
  }
};

export const exportReportToExcel = async (data: ExportReportRequest) => {
  const response = await axiosGatewayBackend.post("/reports/export", data, {
    responseType: 'blob',
  });

  let blob: Blob;
  if (response instanceof Blob) {
    blob = response;
  } else if (response.data instanceof Blob) {
    blob = response.data;
  } else {
    blob = new Blob([response.data || response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const headers = (response as any).headers || {};
  const contentDisposition = headers['content-disposition'] || headers['Content-Disposition'];
  let fileName = 'report.xlsx';
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''));
    }
  }
  
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportDashboardToExcel = async (data: ExportReportRequest) => {
  const response = await axiosGatewayBackend.post("/reports/export-dashboard", data, {
    responseType: 'blob',
  });

  let blob: Blob;
  if (response instanceof Blob) {
    blob = response;
  } else if (response.data instanceof Blob) {
    blob = response.data;
  } else {
    blob = new Blob([response.data || response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const headers = (response as any).headers || {};
  const contentDisposition = headers['content-disposition'] || headers['Content-Disposition'];
  let fileName = 'dashboard.xlsx';
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''));
    }
  }

  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const generateReport = async (data: GenerateReportRequest) => {
  const response = await axiosGatewayBackend.post("/reports/generate", data, {
    responseType: 'blob',
  });

  // Интерцептор возвращает весь response для blob, поэтому нужно проверить структуру
  let blob: Blob;
  if (response instanceof Blob) {
    blob = response;
  } else if (response.data instanceof Blob) {
    blob = response.data;
  } else {
    blob = new Blob([response.data || response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Создаем ссылку для скачивания
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Получаем имя файла из заголовка Content-Disposition
  const headers = (response as any).headers || {};
  const contentDisposition = headers['content-disposition'] || headers['Content-Disposition'];
  let fileName = 'report.xlsx';
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''));
    }
  }
  
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const listReportImports = async (params?: {
  reportType?: string;
  periodFrom?: string;
  periodTo?: string;
  status?: string;
}): Promise<ReportImportBatch[]> => {
  const raw = await useRequest<{ success: boolean; data: ReportImportBatch[] } | ReportImportBatch[]>(
    async () => axiosGatewayBackend.get('/reports/imports', { params }),
  );
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: ReportImportBatch[] }).data)) {
    return (raw as { data: ReportImportBatch[] }).data;
  }
  return [];
};

export const uploadReportImport = async (params: {
  file: File;
  periodFrom: string;
  periodTo: string;
  reportType?: string;
}): Promise<ReportImportBatch> => {
  const form = new FormData();
  form.append('file', params.file);
  form.append('periodFrom', params.periodFrom);
  form.append('periodTo', params.periodTo);
  if (params.reportType) form.append('reportType', params.reportType);

  const raw = await useRequest<{ success: boolean; data: ReportImportBatch } | ReportImportBatch>(
    async () =>
      axiosGatewayBackend.post('/reports/imports', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  );
  if (raw && typeof raw === 'object' && 'data' in raw && (raw as { data: ReportImportBatch }).data) {
    return (raw as { data: ReportImportBatch }).data;
  }
  return raw as ReportImportBatch;
};

export const activateReportImport = async (id: number): Promise<ReportImportBatch> => {
  const raw = await useRequest<{ success: boolean; data: ReportImportBatch } | ReportImportBatch>(
    async () => axiosGatewayBackend.post(`/reports/imports/${id}/activate`),
  );
  if (raw && typeof raw === 'object' && 'data' in raw && (raw as { data: ReportImportBatch }).data) {
    return (raw as { data: ReportImportBatch }).data;
  }
  return raw as ReportImportBatch;
};

export const deleteReportImport = async (id: number): Promise<void> => {
  await useRequest(async () => axiosGatewayBackend.delete(`/reports/imports/${id}`));
};

