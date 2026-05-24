import { TreeProps } from 'antd';
import { ReactNode } from 'react';

export interface TreeNode {
  [key: string]: any;
  title: string;
  children?: TreeNode[];
}

export interface TreeData {
  treeData: TreeNode[];
  total: number;
}

export type FormFieldValue = string | number | boolean | null;

export interface CreateNodeData {
  title: string;
  parent_id?: number | null;
  [key: string]: FormFieldValue | number | undefined;
}

export interface UpdateNodeData {
  title: string;
  [key: string]: FormFieldValue | undefined;
}

export interface FormConfig {
  title: string;
  fields: {
    name: string;
    label: string;
    type: 'input' | 'select' | 'textarea' | 'number';
    rules?: {
      required?: boolean;
      message?: string;
    }[];
    options?: {
      value: string | number;
      label: string;
    }[];
    placeholder?: string;
  }[];
}

export interface TreeConfig {
  title: string;
  apiEndpoint: string;
  addButtonText: string;
  editModalTitle: string;
  deleteModalTitle: string;
  idField: string;
  addFormConfig?: FormConfig;
  editFormConfig?: FormConfig;
  /** Права: если не заданы, действия разрешены */
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export interface TreeMutations {
  createNode: (data: CreateNodeData) => Promise<any>;
  updateNode: (id: number, data: UpdateNodeData) => Promise<any>;
  deleteNode: (id: number) => Promise<any>;
}

export interface TreeCustomization {
  renderNodeTitle?: (node: TreeNode) => ReactNode;
  renderNodeActions?: (node: TreeNode, defaultActions: ReactNode) => ReactNode;
  onNodeSelect?: (node: TreeNode) => void;
  additionalModalFields?: ReactNode;
  treeProps?: Partial<TreeProps>;
} 