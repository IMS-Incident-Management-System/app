import dayjs from "dayjs";
import { ITable } from "../../../interfaces/common/common";
import { IncidentWithRelations } from "../../../interfaces/requests/incident";
import { EIncidentDirection } from "../../../enums/incident";
import { Modal, Tag } from "antd";
import classes from "../Home.module.scss";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";
import { useDeleteIncident } from "../../../services/requests/initiators/deleteIncident";
import { IconButton } from "../../../components/IconButton";
export const usePrepareTableData = (data: ITable<IncidentWithRelations>) => {
  const navigate = useNavigate();

  const handleEditIncident = (id: string) => {
    navigate(ERoutes.INCIDENT_CREATE + `/${id}`);
  };

  const handleViewIncident = (id: string) => {
    navigate(`/incidents/view/${id}`);
  };

  const { mutate: deleteIncident } = useDeleteIncident();

  const handleDeleteIncident = (id: number) => {
    Modal.confirm({
      title: "Удалить инцидент",
      content: (
        <div>
          <p>Вы уверены, что хотите удалить инцидент?</p>
          <p>Вместе с ним будут удалены все связанные с ним данные (инциденты, наказания).</p>
          <p>Это действие нельзя будет отменить.</p>
        </div>
      ),
      onOk: () => deleteIncident(id),
      okText: "Удалить",
      cancelText: "Отмена",
      okButtonProps: {
        danger: true,
      },
    });
  };

  const columnsData = data?.columns?.map((column) => {
    if (column.dataIndex === "incidents") {
      return {
        ...column,
        title: "Тип инцидента", // Изменяем заголовок колонки
        render: (value: any, record: any) => {
          // Теперь у нас массив событий
          if (record.events && record.events.length > 0) {
            // Цвета для разных типов событий
            const getEventTypeColor = (eventTypeId: number) => {
              const colors = ['blue', 'green', 'orange', 'purple', 'red', 'cyan', 'magenta', 'volcano', 'gold', 'lime'];
              return colors[eventTypeId % colors.length];
            };

            return (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px',
                maxWidth: '200px',
                alignItems: 'flex-start'
              }}>
                {record.events.map((event: any, index: number) => (
                  <Tag
                    key={event.id || `${event.event_type?.event_type_id}-${event.event_type?.title}-${index}`}
                    color={getEventTypeColor(event.event_type?.event_type_id || index)}
                    className={classes.tag}
                    style={{
                      margin: '2px 0',
                      fontSize: '12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      border: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {event.event_type?.title}
                  </Tag>
                ))}
                {record.events.length > 3 && (
                  <Tag
                    color="default"
                    style={{
                      margin: '2px 0',
                      fontSize: '11px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      border: '1px dashed #d9d9d9',
                      background: '#fafafa'
                    }}
                  >
                    +{record.events.length - 3} еще
                  </Tag>
                )}
              </div>
            );
          }
          return (
            <span style={{ color: '#999', fontStyle: 'italic' }}>
              Не указано
            </span>
          );
        },
      };
    }




    if (column.dataIndex === "object_type") {
      return {
        ...column,
        title: "Типы объектов",
        render: (value: any, record: any) => {
          // Поддерживаем как новый формат (object_types), так и старый (object_type)
          if (record.object_types && record.object_types.length > 0) {
            return (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px',
                maxWidth: '200px',
                alignItems: 'flex-start'
              }}>
                {record.object_types.map((ot: any, index: number) => (
                  <Tag
                    key={ot.object_type_id || index}
                    color="purple"
                    className={classes.tag}
                    style={{
                      margin: '2px 0',
                      fontSize: '12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      border: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {ot.title}
                  </Tag>
                ))}
                {record.object_types.length > 3 && (
                  <Tag
                    color="default"
                    style={{
                      margin: '2px 0',
                      fontSize: '11px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      border: '1px dashed #d9d9d9',
                      background: '#fafafa'
                    }}
                  >
                    +{record.object_types.length - 3} еще
                  </Tag>
                )}
              </div>
            );
          }
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
              {record?.object_type?.title || "Не указан"}
            </Tag>
          );
        },
      };
    }

    if (column.dataIndex === "direction") {
      return {
        ...column,
        render: (value: any, record: any) => {
          const getDirectionInfo = (direction: string) => {
            switch (direction) {
              case EIncidentDirection.INFORMATION:
                return { text: "ИБ", color: "blue", fullText: "Информационная безопасность" };
              case EIncidentDirection.ECONOMIC:
                return { text: "ЭБ", color: "green", fullText: "Экономическая безопасность" };
              case EIncidentDirection.SECURITY:
                return { text: "БПиО", color: "orange", fullText: "Безопасность производства и охраны" };
              case EIncidentDirection.CYBER:
                return { text: "КБ", color: "purple", fullText: "Кибербезопасность" };
              case EIncidentDirection.ANTIFRAUD:
                return { text: "Антифрод", color: "red", fullText: "Антифрод" };
              case EIncidentDirection.SORM:
                return { text: "СОРМ", color: "cyan", fullText: "СОРМ" };
              default:
                return { text: "Не указано", color: "default", fullText: "Не указано" };
            }
          };

          const directionInfo = getDirectionInfo(record.direction);
          
          return (
            <Tag 
              color={directionInfo.color}
              className={classes.tag}
              style={{
                borderRadius: '6px',
                fontWeight: '600',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '12px'
              }}
              title={directionInfo.fullText}
            >
              {directionInfo.text}
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

    if (column.dataIndex === "code") {
      return {
        ...column,
        render: (value: any, record: any) => {
          return (
            <span style={{ 
              fontWeight: '600',
              color: '#1890ff',
              fontSize: '14px'
            }}>
              {value || `#${record.id}`}
            </span>
          );
        },
      };
    }

    if (column.dataIndex === "createdAt") {
      return {
        ...column,
        render: (value: any, record: any) => {
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
  });

  const columnActions = [
    {
      key: "delete",
      dataIndex: "delete",
      title: "Действия",
      position: "right",
      fixed: 'right' as const,
      width: 140,
      render: (value: any, record: any) => {
        return (
          <div className={classes.actions}>
            <IconButton
              onClick={() => handleViewIncident(record.id)}
              icon={<EyeOutlined />}
              tooltip="Просмотреть инцидент"
            />
            <IconButton
              onClick={() => handleEditIncident(record.id)}
              icon={<EditOutlined />}
              tooltip="Редактировать инцидент"
            />
            <IconButton
              onClick={() => handleDeleteIncident(record.id)}
              icon={<DeleteOutlined />}
              tooltip="Удалить инцидент"
            />
          </div>
        );
      },
    },
  ];

  const dataSource = data?.dataSource?.map((item) => ({
    ...item,
    createdAt: dayjs(item.createdAt).format("DD.MM.YYYY"),
    direction: item.direction,
    department: item.department?.title,
    key: item.id + item.createdAt.toString(),
  }));

  return {
    columns: [...(columnsData ?? []), ...columnActions],
    dataSource: dataSource ?? [],
  };
};
