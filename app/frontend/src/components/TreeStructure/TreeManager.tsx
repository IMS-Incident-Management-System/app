import React, { useState, useMemo } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { useQuery } from 'react-query';
import { TreeNode, TreeData, CreateNodeData, UpdateNodeData, TreeConfig, TreeMutations, TreeCustomization, FormConfig } from './types';
import { axiosGatewayBackend } from '../../plugins/axios';
import { PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import styles from './TreeManager.module.scss';
import { SpinComponent } from '../Spin/Spin';
import { PageHeader } from '../PageHeader';
import { IconButton } from '../IconButton';
import { TreeVisualization } from './TreeVisualization';
import { PrimaryButton } from '../PrimaryButton';

const { TextArea } = Input;

interface TreeManagerProps {
  config: TreeConfig;
  mutations: TreeMutations;
  customization?: TreeCustomization;
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

const TreeManager: React.FC<TreeManagerProps> = ({ config, mutations, customization = {} }) => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: rawData, isLoading: isDataLoading, refetch } = useQuery<TreeData>(
    [config.apiEndpoint],
    async () => {
      const response = await axiosGatewayBackend.get(config.apiEndpoint);
      return response.data;
    }
  );

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

  const statistics = useMemo(() => {
    const countNodes = (nodes: TreeNode[], depth = 0): { total: number; byLevel: number[]; maxDepth: number } => {
      let total = nodes.length;
      let byLevel = [nodes.length];
      let maxDepth = depth;
      
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          const childStats = countNodes(node.children, depth + 1);
          total += childStats.total;
          maxDepth = Math.max(maxDepth, childStats.maxDepth);
          
          childStats.byLevel.forEach((count, index) => {
            const level = index + depth + 1;
            byLevel[level] = (byLevel[level] || 0) + count;
          });
        }
      });
      
      return { total, byLevel, maxDepth };
    };
    
    return countNodes(treeData);
  }, [treeData]);

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
      centered: true,
      okButtonProps: {
        danger: true,
        size: 'large',
        style: {
          borderRadius: '8px',
          fontWeight: 600,
          height: '44px',
          padding: '0 32px'
        }
      },
      cancelButtonProps: {
        size: 'large',
        style: {
          borderRadius: '8px',
          fontWeight: 500,
          height: '44px',
          padding: '0 32px'
        }
      }
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
      <PageHeader
        title={config.title}
        actions={
          <>
            <IconButton
              buttonStyle="glass"
              icon={<BarChartOutlined />}
              onClick={() => setIsStatsVisible(!isStatsVisible)}
              tooltip={isStatsVisible ? "Скрыть статистику" : "Показать статистику"}
            />
            <PrimaryButton icon={<PlusOutlined />} onClick={() => handleAdd()}>
              {config.addButtonText}
            </PrimaryButton>
          </>
        }
      />

      {treeData.length > 0 && isStatsVisible && (
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.total}</div>
              <div className={styles.statLabel}>Всего элементов</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎯</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{treeData.length}</div>
              <div className={styles.statLabel}>Корневых</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.maxDepth + 1}</div>
              <div className={styles.statLabel}>Уровней</div>
            </div>
          </div>
          <div className={styles.levelDistribution}>
            {statistics.byLevel.map((count, index) => (
              <div key={index} className={styles.levelBar} title={`Уровень ${index + 1}: ${count} элементов`}>
                <div 
                  className={styles.levelBarFill}
                  style={{ 
                    height: `${(count / Math.max(...statistics.byLevel)) * 100}%`,
                    background: `linear-gradient(180deg, ${index === 0 ? '#2a5298' : index === 1 ? '#5a7a9c' : index === 2 ? '#6c8aa8' : '#7d99b5'} 0%, ${index === 0 ? '#1e3c72' : index === 1 ? '#3d5a7a' : index === 2 ? '#5a7a9c' : '#6c8aa8'} 100%)`
                  }}
                >
                  <span className={styles.levelBarValue}>{count}</span>
                </div>
                <div className={styles.levelBarLabel}>L{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TreeVisualization
        data={treeData}
        idField={config.idField}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        title={config.addFormConfig?.title || "Добавить"}
        open={isAddModalVisible}
        onOk={handleAddSubmit}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Сохранить"
        cancelText="Отмена"
        width={600}
        centered
        okButtonProps={{
          size: 'large',
          style: {
            borderRadius: '8px',
            fontWeight: 600,
            height: '44px',
            padding: '0 32px'
          }
        }}
        cancelButtonProps={{
          size: 'large',
          style: {
            borderRadius: '8px',
            fontWeight: 500,
            height: '44px',
            padding: '0 32px'
          }
        }}
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
        width={600}
        centered
        okButtonProps={{
          size: 'large',
          style: {
            borderRadius: '8px',
            fontWeight: 600,
            height: '44px',
            padding: '0 32px'
          }
        }}
        cancelButtonProps={{
          size: 'large',
          style: {
            borderRadius: '8px',
            fontWeight: 500,
            height: '44px',
            padding: '0 32px'
          }
        }}
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