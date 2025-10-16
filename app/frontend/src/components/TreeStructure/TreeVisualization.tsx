import React, { useState } from 'react';
import { TreeNode } from './types';
import styles from './TreeVisualization.module.scss';
import { Button } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { IconButton } from '../IconButton';

interface TreeVisualizationProps {
  data: TreeNode[];
  idField: string;
  onAdd: (node?: TreeNode) => void;
  onEdit: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
}

interface TreeNodeItemProps {
  node: TreeNode;
  idField: string;
  level: number;
  isLast: boolean;
  parentPath: boolean[];
  onAdd: (node?: TreeNode) => void;
  onEdit: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  idField,
  level,
  isLast,
  parentPath,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const levelColors = [
    { bg: '#f0f5ff', border: '#2a5298', shadow: 'rgba(42, 82, 152, 0.15)' },
    { bg: '#f6ffed', border: '#52c41a', shadow: 'rgba(82, 196, 26, 0.15)' },
    { bg: '#fff7e6', border: '#fa8c16', shadow: 'rgba(250, 140, 22, 0.15)' },
    { bg: '#fff1f0', border: '#ff4d4f', shadow: 'rgba(255, 77, 79, 0.15)' },
    { bg: '#f9f0ff', border: '#722ed1', shadow: 'rgba(114, 46, 209, 0.15)' },
  ];

  const colorScheme = levelColors[level % levelColors.length];

  return (
    <div className={styles.nodeWrapper}>
      {/* Карточка узла */}
      <div className={`${styles.nodeCard} ${styles[`level${level}`]}`}
        style={{
          background: colorScheme.bg,
          borderColor: colorScheme.border,
          '--node-border': colorScheme.border,
          '--node-shadow': colorScheme.shadow,
        } as React.CSSProperties}
      >
        <div className={styles.nodeContent}>
          {hasChildren && (
            <button
              className={styles.expandButton}
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                borderColor: colorScheme.border,
                color: colorScheme.border,
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
          <div className={styles.levelBadge} style={{ background: colorScheme.border }}>
            L{level + 1}
          </div>
          <div className={styles.nodeTitle}>{node.title}</div>
          <div className={styles.nodeActions}>
            <IconButton
              icon={<PlusOutlined />}
              onClick={(e) => {
                e?.stopPropagation();
                onAdd(node);
              }}
              tooltip="Добавить дочерний"
              size="small"
            />
            <IconButton
              icon={<EditOutlined />}
              onClick={(e) => {
                e?.stopPropagation();
                onEdit(node);
              }}
              tooltip="Редактировать"
              size="small"
            />
            <IconButton
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e?.stopPropagation();
                onDelete(node);
              }}
              tooltip="Удалить"
              size="small"
            />
          </div>
        </div>
        {hasChildren && (
          <div className={styles.childrenIndicator}>
            <div className={styles.childrenLine} style={{ background: colorScheme.border }} />
            <div className={styles.childrenCount}>
              {node.children!.length} {node.children!.length === 1 ? 'дочерний элемент' : 'дочерних элементов'}
            </div>
          </div>
        )}
      </div>

      {/* Дочерние элементы */}
      {hasChildren && isExpanded && (
        <div className={styles.children}>
          <div className={styles.childrenConnector} style={{ borderColor: colorScheme.border }}>
            {node.children!.map((child, index) => (
              <div key={child[idField]} className={styles.childBranch}>
                <div className={styles.branchLine} style={{ background: colorScheme.border }} />
                <TreeNodeItem
                  node={child}
                  idField={idField}
                  level={level + 1}
                  isLast={index === node.children!.length - 1}
                  parentPath={[...parentPath, !isLast]}
                  onAdd={onAdd}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  data,
  idField,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.treeContainer}>
      {data.map((node, index) => (
        <TreeNodeItem
          key={node[idField]}
          node={node}
          idField={idField}
          level={0}
          isLast={index === data.length - 1}
          parentPath={[]}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
