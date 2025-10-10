import dayjs from "dayjs";
import { ITable } from "../../../interfaces/common/common";
import { EventWithRelations } from "../../../interfaces/requests/event";
import { Button, Modal, Tag } from "antd";
import classes from "../EventsList.module.scss";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";
import { useDeleteEvent } from "../../../services/requests/events/deleteEvent";
import { EventDirectionLabels, getCategoryLabel } from "../../../enums/event";

export const usePrepareTableData = (data: ITable<EventWithRelations>) => {
  const navigate = useNavigate();

  const handleEditEvent = (id: string) => {
    navigate(ERoutes.EVENT_CREATE + `/${id}`);
  };

  const handleViewEvent = (id: string) => {
    navigate(ERoutes.EVENT_VIEW + `/${id}`);
  };

  const { mutate: deleteEvent } = useDeleteEvent();

  const handleDeleteEvent = (id: number) => {
    Modal.confirm({
      title: "Удалить событие",
      content: (
        <div>
          <p>Вы уверены, что хотите удалить событие?</p>
          <p>Это действие нельзя будет отменить.</p>
        </div>
      ),
      onOk: () => deleteEvent(id),
      okText: "Удалить",
      cancelText: "Отмена",
      okButtonProps: {
        danger: true,
      },
    });
  };

  const columnsData = data?.columns?.map((column) => {
    if (column.dataIndex === "direction") {
      return {
        ...column,
        render: (value: any, record: any) => {
          const label = EventDirectionLabels[record.direction] || "Не указано";
          const getColor = (direction: string) => {
            if (direction === 'INFORMATION') return 'blue';
            if (direction === 'ECONOMIC') return 'green';
            if (direction === 'SECURITY') return 'orange';
            return 'default';
          };

          return (
            <Tag
              color={getColor(record.direction)}
              className={classes.tag}
              style={{
                borderRadius: '6px',
                fontWeight: '600',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '12px'
              }}
            >
              {label}
            </Tag>
          );
        },
      };
    }

    if (column.dataIndex === "category") {
      return {
        ...column,
        render: (value: any, record: any) => {
          return (
            <Tag
              color="purple"
              className={classes.tag}
              style={{
                borderRadius: '6px',
                fontWeight: '500',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {getCategoryLabel(record.category)}
            </Tag>
          );
        },
      };
    }

    if (column.dataIndex === "department") {
      return {
        ...column,
        render: (value: any, record: any) => {
          return (
            <span style={{
              fontWeight: '500',
              color: '#262626'
            }}>
              {record?.department || "Не указано"}
            </span>
          );
        },
      };
    }

    if (column.dataIndex === "period_date") {
      return {
        ...column,
        render: (value: any) => {
          return (
            <span style={{
              color: '#595959',
              fontSize: '13px'
            }}>
              {value ? dayjs(value).format("DD.MM.YYYY") : "Не указано"}
            </span>
          );
        },
      };
    }

    if (column.dataIndex === "createdAt") {
      return {
        ...column,
        render: (value: any) => {
          return (
            <span style={{
              color: '#595959',
              fontSize: '13px'
            }}>
              {value}
            </span>
          );
        },
      };
    }

    return column;
  }).filter(column => column.dataIndex !== 'created_by'); // Убираем столбец "Создал"

  const columnActions = [
    {
      key: "actions",
      dataIndex: "actions",
      title: "Действия",
      position: "right",
      render: (value: any, record: any) => {
        return (
          <div className={classes.actions} style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Button
              type="text"
              onClick={() => handleViewEvent(record.id)}
              shape="circle"
              icon={<EyeOutlined />}
              size="middle"
              title="Просмотреть событие"
              style={{
                color: '#1890ff',
                border: '1px solid #1890ff',
                background: '#ffffff',
                boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1890ff';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#1890ff';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
            <Button
              type="text"
              onClick={() => handleEditEvent(record.id)}
              shape="circle"
              icon={<EditOutlined />}
              size="middle"
              title="Редактировать событие"
              style={{
                color: '#52c41a',
                border: '1px solid #52c41a',
                background: '#ffffff',
                boxShadow: '0 2px 4px rgba(82, 196, 26, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#52c41a';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#52c41a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
            <Button
              type="text"
              danger
              onClick={() => handleDeleteEvent(record.id)}
              shape="circle"
              icon={<DeleteOutlined />}
              size="middle"
              title="Удалить событие"
              style={{
                color: '#ff4d4f',
                border: '1px solid #ff4d4f',
                background: '#ffffff',
                boxShadow: '0 2px 4px rgba(255, 77, 79, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff4d4f';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#ff4d4f';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </div>
        );
      },
    },
  ];

  const dataSource = data?.dataSource?.map((item) => ({
    ...item,
    createdAt: dayjs(item.createdAt).format("DD.MM.YYYY HH:mm"),
    department: item.department?.title,
    key: item.id + (item.createdAt?.toString() || ''),
  }));

  return {
    columns: [...(columnsData ?? []), ...columnActions],
    dataSource: dataSource ?? [],
  };
};

