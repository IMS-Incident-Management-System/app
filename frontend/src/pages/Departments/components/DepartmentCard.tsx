import React from "react";
import { Card, Button } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { DepartmentNode } from "../types";
import styles from "../Departments.module.scss";

interface DepartmentCardProps {
  department: DepartmentNode;
  onEdit: (node: DepartmentNode) => void;
  onAdd: (node: DepartmentNode) => void;
  onDelete: (node: DepartmentNode) => void;
  level: number;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit,
  onAdd,
  onDelete,
  level,
}) => {
  const hasChildren = department.children && department.children.length > 0;

  return (
    <Card
      title={department.title}
      className={`${styles.card} ${styles[`level${level}`]} ${hasChildren ? styles.hasChildren : ""}`}
      styles={{
        body: {
          display: level > 0 && !hasChildren ? "none" : "block",
        },
      }}
      extra={
        <div className={styles.actions}>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => onAdd(department)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(department)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(department)}
            danger
          />
        </div>
      }
    >
      {department.children && department.children.length > 0 && (
        <div className={styles.children}>
          {department.children.map((child) => (
            <DepartmentCard
              key={child.key}
              department={child}
              onEdit={onEdit}
              onAdd={onAdd}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
