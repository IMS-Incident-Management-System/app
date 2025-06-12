export interface DepartmentNode {
  key: string;
  value: string;
  title: string;
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
  onSubmit: (values: DepartmentFormData, parentDepartmentId: string | null) => void;
} 