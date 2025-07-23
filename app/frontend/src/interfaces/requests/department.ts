export interface DepartmentModelTypeTree {
  department_id: number;
  value: string;
  title: string;
  children: DepartmentModelTypeTree[];
}

export interface DepartmentModelType {
  treeData: DepartmentModelTypeTree[];
}