import dayjs from "dayjs";
import { ITable } from "../../../interfaces/common/common";
import { EventWithRelations } from "../../../interfaces/requests/event";
import { Modal } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";
import { useDeleteEvent } from "../../../services/requests/events/deleteEvent";
import { IconButton } from "../../../components/IconButton";

export const usePrepareEventsTableData = (data: ITable<EventWithRelations>) => {
  const navigate = useNavigate();

  const handleEditEvent = (id: string) => {
    navigate(ERoutes.EVENT_CREATE + `/${id}`);
  };

  const handleViewEvent = (id: string) => {
    navigate(`${ERoutes.EVENT_VIEW}/${id}`);
  };

  const { mutate: deleteEvent } = useDeleteEvent();

  const handleDeleteEvent = (id: number) => {
    Modal.confirm({
      title: "Удалить событие",
      content: (
        <div>
          <p>Вы уверены, что хотите удалить событие?</p>
          <p>Вместе с ним будут удалены все связанные с ним данные (дополнения, наказания).</p>
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
    if (column.key === "actions") {
      return {
        ...column,
        render: (_: any, record: EventWithRelations) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <IconButton
              icon={<EyeOutlined />}
              onClick={() => handleViewEvent(record.id.toString())}
              tooltip="Просмотр"
            />
            <IconButton
              icon={<EditOutlined />}
              onClick={() => handleEditEvent(record.id.toString())}
              tooltip="Редактировать"
            />
            <IconButton
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteEvent(record.id)}
              tooltip="Удалить"
              danger
            />
          </div>
        ),
      };
    }
    if (column.key === "date") {
      return {
        ...column,
        render: (date: string) => (date ? dayjs(date).format("DD.MM.YYYY") : "-"),
      };
    }
    if (column.key === "createdAt") {
      return {
        ...column,
        render: (date: string) => (date ? dayjs(date).format("DD.MM.YYYY HH:mm") : "-"),
      };
    }
    if (column.key === "code") {
      return {
        ...column,
        render: (value: any, record: EventWithRelations) => (
          <span style={{ 
            fontWeight: '600',
            color: '#1890ff',
            fontSize: '14px'
          }}>
            {value || `#${record.id}`}
          </span>
        ),
      };
    }
    if (column.key === "department") {
      return {
        ...column,
        render: (department: any) => department?.title || "-",
      };
    }
    return column;
  });

  return {
    columns: columnsData || [],
    dataSource: data?.dataSource || [],
  };
};

