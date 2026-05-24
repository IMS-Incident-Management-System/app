export interface DepartmentModelTypeTree {
  department_id: number;
  key: string;
  value: string;
  title: string;
  children: DepartmentModelTypeTree[];
}

export interface DepartmentModelType {
  treeData: DepartmentModelTypeTree[];
}