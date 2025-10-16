import dayjs from "dayjs";
import { ITable } from "../../../interfaces/common/common";
import { EventWithRelations } from "../../../interfaces/requests/event";
import { Modal, Tag } from "antd";
import classes from "../EventsList.module.scss";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";
import { useDeleteEvent } from "../../../services/requests/events/deleteEvent";
import { EventDirectionLabels, getCategoryLabel } from "../../../enums/event";
import { IconButton } from "../../../components/IconButton";

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
          const label = EventDirectionLabels[record.direction as keyof typeof EventDirectionLabels] || "Не указано";
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
        title: "Период",
        render: (value: any, record: any) => {
          const from = record.period_from ? dayjs(record.period_from).format("DD.MM.YYYY") : null;
          const to = record.period_to ? dayjs(record.period_to).format("DD.MM.YYYY") : null;
          
          return (
            <span style={{
              color: '#595959',
              fontSize: '13px'
            }}>
              {from && to ? `${from} - ${to}` : "Не указано"}
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
      fixed: 'right' as const,
      width: 140,
      render: (value: any, record: any) => {
        return (
          <div className={classes.actions}>
            <IconButton
              onClick={() => handleViewEvent(record.id)}
              icon={<EyeOutlined />}
              tooltip="Просмотреть событие"
            />
            <IconButton
              onClick={() => handleEditEvent(record.id)}
              icon={<EditOutlined />}
              tooltip="Редактировать событие"
            />
            <IconButton
              onClick={() => handleDeleteEvent(record.id)}
              icon={<DeleteOutlined />}
              tooltip="Удалить событие"
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

