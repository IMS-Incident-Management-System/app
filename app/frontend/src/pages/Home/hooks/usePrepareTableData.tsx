import dayjs from "dayjs";
import { ITable } from "../../../interfaces/common/common";
import { IncidentWithRelations } from "../../../interfaces/requests/incident";
import { EIncidentDirection } from "../../../enums/incident";
import { Button, Modal, Tag } from "antd";
import classes from "../Home.module.scss";
import { CopyOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";
import { useDeleteIncident } from "../../../services/requests/initiators/deleteIncident";
import classNames from "classnames";
export const usePrepareTableData = (data: ITable<IncidentWithRelations>) => {
  const navigate = useNavigate();

  const handleEditIncident = (id: string) => {
    navigate(ERoutes.INCIDENT_CREATE + `/${id}`);
  };

  const handleDuplicateIncident = (id: string) => {
    navigate(ERoutes.INCIDENT_DUPLICATE + `/${id}`);
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
              onClick={() => handleViewIncident(record.id)}
              shape="circle"
              icon={<EyeOutlined />}
              size="middle"
              title="Просмотреть инцидент"
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
              onClick={() => handleEditIncident(record.id)}
              shape="circle"
              icon={<EditOutlined />}
              size="middle"
              title="Редактировать инцидент"
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
              onClick={() => handleDuplicateIncident(record.id)}
              shape="circle"
              icon={<CopyOutlined />}
              size="middle"
              title="Дублировать инцидент"
              style={{
                color: '#fa8c16',
                border: '1px solid #fa8c16',
                background: '#ffffff',
                boxShadow: '0 2px 4px rgba(250, 140, 22, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fa8c16';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#fa8c16';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
            <Button
              type="text"
              danger
              onClick={() => handleDeleteIncident(record.id)}
              shape="circle"
              icon={<DeleteOutlined />}
              size="middle"
              title="Удалить инцидент"
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
