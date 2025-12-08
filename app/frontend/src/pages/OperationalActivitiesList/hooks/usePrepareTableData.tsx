import dayjs from "dayjs";
import { ITable } from "../../../interfaces/common/common";
import { OperationalActivityWithRelations } from "../../../interfaces/requests/operationalActivity";
import { Modal, Tag } from "antd";
import classes from "../OperationalActivitiesList.module.scss";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";
import { useDeleteOperationalActivity } from "../../../services/requests/operationalActivities/deleteOperationalActivity";
import { OperationalActivityDirectionLabels } from "../../../enums/operationalActivity";
import { IconButton } from "../../../components/IconButton";

export const usePrepareTableData = (data: ITable<OperationalActivityWithRelations>) => {
  const navigate = useNavigate();

  const handleEditOperationalActivity = (id: string) => {
    navigate(ERoutes.OPERATIONAL_ACTIVITY_EDIT.replace(':id', id));
  };

  const handleViewOperationalActivity = (id: string) => {
    navigate(ERoutes.OPERATIONAL_ACTIVITY_VIEW_ID.replace(':id', id));
  };

  const { mutate: deleteOperationalActivity } = useDeleteOperationalActivity();

  const handleDeleteOperationalActivity = (id: number) => {
    Modal.confirm({
      title: "Удалить операционную деятельность",
      content: (
        <div>
          <p>Вы уверены, что хотите удалить операционную деятельность?</p>
          <p>Это действие нельзя будет отменить.</p>
        </div>
      ),
      onOk: () => deleteOperationalActivity(id),
      okText: "Удалить",
      cancelText: "Отмена",
      okButtonProps: {
        danger: true,
      },
    });
  };

  const columnsData = (data?.columns || [])?.map((column) => {
    if (column.dataIndex === "direction") {
      return {
        ...column,
        render: (value: any, record: any) => {
          const label = OperationalActivityDirectionLabels[record.direction as keyof typeof OperationalActivityDirectionLabels] || "Не указано";
          const getColor = (direction: string) => {
            if (direction === 'INFORMATION') return 'blue';
            if (direction === 'ECONOMIC') return 'green';
            if (direction === 'SECURITY') return 'orange';
            if (direction === 'CYBER') return 'purple';
            if (direction === 'ANTIFRAUD') return 'red';
            if (direction === 'SORM') return 'cyan';
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
  }).filter(column => column.dataIndex !== 'created_by' && column.dataIndex !== 'category'); // Убираем столбцы "Создал" и "Категория"

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
              onClick={() => handleViewOperationalActivity(record.id)}
              icon={<EyeOutlined />}
              tooltip="Просмотреть операционную деятельность"
            />
            <IconButton
              onClick={() => handleEditOperationalActivity(record.id)}
              icon={<EditOutlined />}
              tooltip="Редактировать операционную деятельность"
            />
            <IconButton
              onClick={() => handleDeleteOperationalActivity(record.id)}
              icon={<DeleteOutlined />}
              tooltip="Удалить операционную деятельность"
            />
          </div>
        );
      },
    },
  ];

  const dataSource = (data?.dataSource || [])?.map((item) => ({
    ...item,
    createdAt: item.createdAt ? dayjs(item.createdAt).format("DD.MM.YYYY HH:mm") : '',
    department: item.department?.title,
    key: item.id + (item.createdAt?.toString() || ''),
  }));

  return {
    columns: [...(columnsData ?? []), ...columnActions],
    dataSource: dataSource ?? [],
  };
};

