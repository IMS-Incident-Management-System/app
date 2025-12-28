import { axiosGatewayBackend } from "../../plugins/axios";
import { useRequest } from "../../hooks/useRequest";

export interface ReportField {
  entity: 'incident' | 'event' | 'operationalActivity';
  field: string;
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

