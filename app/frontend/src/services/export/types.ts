export interface ExportOptions {
  includeImages?: boolean;
  includeCharts?: boolean;
  format?: 'pdf' | 'docx';
  language?: 'ru' | 'en';
}

export interface ExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
}
