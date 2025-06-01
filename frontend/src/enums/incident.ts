export enum EIncidentDirection {
    INFORMATION = 'INFORMATION', // ИБ
    ECONOMIC = 'ECONOMIC', // ЭБ
    SECURITY = 'SECURITY', // БПиО
  }
  
  export enum EIncidentStatus {
    DRAFT = 'DRAFT', // Черновик
    IN_PROGRESS = 'IN_PROGRESS', // В работе
    COMPLETED = 'COMPLETED', // Завершен
    ARCHIVED = 'ARCHIVED', // В архиве
  }