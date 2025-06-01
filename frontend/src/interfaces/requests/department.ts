export interface DepartmentModelType {
  department_id: number;
  name: string;
  type: 'KTS' | 'FO' | 'DZK' | 'ETSKB'; // КЦ, ФО, ДЗК, ЕЦКБ
  parent_id: number | null;
  region_type?: string; // For FO subdivisions
}
