import React, { useState } from "react";
import { useGetDepartments } from "../../services/requests/departments/getDepartments";
import { useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "../../services/requests/departments/mutations";
import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./Departments.module.scss";
import { DepartmentModelTypeTree } from "../../interfaces/requests/department";
import { SpinComponent } from "../../components/Spin/Spin";
import { DepartmentCard } from "./components/DepartmentCard";
import { EditDepartmentForm } from "./forms/EditDepartmentForm";
import { AddDepartmentForm } from "./forms/AddDepartmentForm";
import { DepartmentFormData, DepartmentNode } from "./types";

export const Departments = () => {
  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments();
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentNode | null>(null);
  const [addingParentId, setAddingParentId] = useState<number | null>(null);

  const processedData = React.useMemo(() => {
    if (!departments?.treeData) return [];
    const addKeys = (nodes: DepartmentModelTypeTree[]): DepartmentNode[] => {
      return nodes.map((node) => ({
        ...node,
        key: node.value,
        children: node.children ? addKeys(node.children) : [],
      }));
    };
    return addKeys(departments.treeData);
  }, [departments]);

  const handleEdit = (node: DepartmentNode) => {
    setEditingDepartment(node);
    setEditModalVisible(true);
  };

  const handleAdd = (parentNode: DepartmentNode | null) => {
    console.log(parentNode)
    setAddingParentId(parentNode?.department_id || null);
    setAddModalVisible(true);
  };

  const handleDelete = (node: DepartmentNode) => {
    Modal.confirm({
      title: "Вы уверены что хотите удалить департамент?",
      content: "Это действие нельзя будет отменить.",
      onOk: () => {
        deleteDepartmentMutation.mutate(node.department_id);
      },
    });
  };

  const handleEditSubmit = (values: DepartmentFormData) => {
    if (!editingDepartment?.department_id) return;
    
    updateDepartmentMutation.mutate(
      {
        id: editingDepartment.department_id,
        data: { title: values.title }
      },
      {
        onSuccess: () => {
          setEditModalVisible(false);
          setEditingDepartment(null);
        }
      }
    );
  };

  const handleAddSubmit = (values: DepartmentFormData) => {
    createDepartmentMutation.mutate(
      {
        title: values.title,
        parent_id: addingParentId
      },
      {
        onSuccess: () => {
          setAddModalVisible(false);
          setAddingParentId(null);
        }
      }
    );
  };

  if (isDepartmentsLoading) {
    return <SpinComponent />;
  }

  return (
    <div className={styles.departmentsContainer}>
      <div className={styles.header}>
        <h2>Организационная структура</h2>
        <div className={styles.rootActions}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAdd(null)}
            className={styles.addRootButton}
          >
            Добавить корневой департамент
          </Button>
        </div>
      </div>

      <div className={styles.departmentsGrid}>
        {processedData.map((department) => (
          <DepartmentCard
            key={department.key}
            department={department}
            onEdit={handleEdit}
            onAdd={handleAdd}
            onDelete={handleDelete}
            level={0}
          />
        ))}
      </div>

      <EditDepartmentForm
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingDepartment(null);
        }}
        onSubmit={handleEditSubmit}
        initialValues={
          editingDepartment ? { title: editingDepartment.title } : undefined
        }
      />

      <AddDepartmentForm
        visible={addModalVisible}
        parentDepartmentId={addingParentId}
        onCancel={() => {
          setAddModalVisible(false);
          setAddingParentId(null);
        }}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
};
