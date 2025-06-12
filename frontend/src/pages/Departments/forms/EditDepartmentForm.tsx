import React from "react";
import { Form, Input } from "antd";
import { DepartmentFormData } from "../types";
import { ModalComponent } from "../../../components/Modal/Modal";

interface EditDepartmentFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: DepartmentFormData) => void;
  initialValues?: DepartmentFormData;
}

export const EditDepartmentForm: React.FC<EditDepartmentFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    });
  };

  return (
    <ModalComponent
      title="Редактировать департамент"
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