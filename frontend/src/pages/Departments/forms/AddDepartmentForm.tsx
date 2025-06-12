import React from "react";
import { Form, Input } from "antd";
import { DepartmentFormData } from "../types";
import { ModalComponent } from "../../../components/Modal/Modal";

interface AddDepartmentFormProps {
  visible: boolean;
  parentDepartmentId: number | null;
  onCancel: () => void;
  onSubmit: (values: DepartmentFormData) => void;
}

export const AddDepartmentForm: React.FC<AddDepartmentFormProps> = ({
  visible,
  parentDepartmentId,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    });
  };

  return (
    <ModalComponent
      title="Добавить департамент"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название департамента" }]}
        >
          <Input placeholder="Введите название департамента" />
        </Form.Item>
      </Form>
    </ModalComponent>
  );
}; 