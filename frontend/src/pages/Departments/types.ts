import { DepartmentModelTypeTree } from "../../interfaces/requests/department";

export interface DepartmentNode extends DepartmentModelTypeTree {
  key: string;
  department_id: number;
  children: DepartmentNode[];
}

export interface DepartmentFormData {
  title: string;
}

export interface EditDepartmentFormProps {
  visible: boolean;
  departmentId: string | null;
  onCancel: () => void;
  onSubmit: (values: DepartmentFormData, departmentId: string) => void;
  initialValues?: {
    title: string;
  };
}

export interface AddDepartmentFormProps {
  visible: boolean;
  parentDepartmentId: string | null;
  onCancel: () => void;
  onSubmit: (values: DepartmentFormData, departmentId: string | null) => void;
}
