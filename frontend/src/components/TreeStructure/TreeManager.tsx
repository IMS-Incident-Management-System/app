import React, { useState, useMemo } from 'react';
import { Card, Button, Modal, Form, Input, Select, InputNumber } from 'antd';
import { useQuery } from 'react-query';
import { TreeNode, TreeData, CreateNodeData, UpdateNodeData, TreeConfig, TreeMutations, TreeCustomization, FormConfig } from './types';
import { axiosGatewayBackend } from '../../plugins/axios';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './TreeManager.module.scss';
import { SpinComponent } from '../Spin/Spin';

const { TextArea } = Input;

interface TreeManagerProps {
  config: TreeConfig;
  mutations: TreeMutations;
  customization?: TreeCustomization;
}

interface NodeCardProps {
  node: TreeNode;
  onEdit: (node: TreeNode) => void;
  onAdd: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  level: number;
  idField: string;
}

const renderFormField = (field: FormConfig['fields'][0]) => {
  switch (field.type) {
    case 'select':
      return (
        <Select placeholder={field.placeholder}>
          {field.options?.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      );
    case 'textarea':
      return <TextArea rows={4} placeholder={field.placeholder} />;
    case 'number':
      return <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} />;
    case 'input':
    default:
      return <Input placeholder={field.placeholder} />;
  }
};

const NodeCard: React.FC<NodeCardProps> = ({
  node,
  onEdit,
  onAdd,
  onDelete,
  level,
  idField,
}) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Card
      title={node.title}
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
            onClick={(e) => {
              e.stopPropagation();
              onAdd(node);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
            }}
            danger
          />
        </div>
      }
    >
      {node.children && node.children.length > 0 && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <NodeCard
              key={child[idField]}
              node={child}
              onEdit={onEdit}
              onAdd={onAdd}
              onDelete={onDelete}
              level={level + 1}
              idField={idField}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const TreeManager: React.FC<TreeManagerProps> = ({ config, mutations, customization = {} }) => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Queries
  const { data: rawData, isLoading: isDataLoading, refetch } = useQuery<TreeData>(
    [config.apiEndpoint],
    async () => {
      const response = await axiosGatewayBackend.get(config.apiEndpoint);
      return response.data;
    }
  );

  // Process data and add keys
  const treeData = useMemo(() => {
    if (!rawData?.treeData) return [];
    
    const addKeys = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => ({
        ...node,
        key: node[config.idField],
        children: node.children ? addKeys(node.children) : [],
      }));
    };
    
    return addKeys(rawData.treeData);
  }, [rawData, config.idField]);

  // Handlers
  const handleAdd = (node?: TreeNode) => {
    form.resetFields();
    setSelectedNode(node || null);
    setIsAddModalVisible(true);
  };

  const handleEdit = (node: TreeNode) => {
    setSelectedNode(node);
    form.setFieldsValue(node);
    setIsEditModalVisible(true);
  };

  const handleDelete = (node: TreeNode) => {
    Modal.confirm({
      title: "Вы уверены, что хотите удалить этот элемент?",
      content: "Это действие нельзя будет отменить. Все дочерние элементы также будут удалены.",
      okText: "Удалить",
      cancelText: "Отмена",
      onOk: () => handleDeleteConfirm(node),
    });
  };

  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields();
      await mutations.createNode({
        ...values,
        parent_id: selectedNode ? selectedNode[config.idField] : undefined,
      });
      setIsAddModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Error creating node:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedNode) return;
    try {
      const values = await form.validateFields();
      await mutations.updateNode(selectedNode[config.idField]!, values);
      setIsEditModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Error updating node:', error);
    }
  };

  const handleDeleteConfirm = async (node: TreeNode) => {
    try {
      await mutations.deleteNode(node[config.idField]!);
      refetch();
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  if (isDataLoading) {
    return <SpinComponent />;
  }

  const renderFormFields = (formConfig?: FormConfig) => {
    if (!formConfig) {
      return (
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: 'Пожалуйста, введите название' }]}
        >
          <Input />
        </Form.Item>
      );
    }

    return formConfig.fields.map(field => (
      <Form.Item
        key={field.name}
        name={field.name}
        label={field.label}
        rules={field.rules || []}
      >
        {renderFormField(field)}
      </Form.Item>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{config.title}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
          {config.addButtonText}
        </Button>
      </div>

      <div className={styles.grid}>
        {treeData.map((node) => (
          <NodeCard
            key={node[config.idField]}
            node={node}
            onEdit={handleEdit}
            onAdd={handleAdd}
            onDelete={handleDelete}
            level={0}
            idField={config.idField}
          />
        ))}
      </div>

      <Modal
        title={config.addFormConfig?.title || "Добавить"}
        open={isAddModalVisible}
        onOk={handleAddSubmit}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          {renderFormFields(config.addFormConfig)}
          {customization.additionalModalFields}
        </Form>
      </Modal>

      <Modal
        title={config.editFormConfig?.title || "Редактировать"}
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          {renderFormFields(config.editFormConfig)}
          {customization.additionalModalFields}
        </Form>
      </Modal>
    </div>
  );
};

export default TreeManager; 