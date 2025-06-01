import dayjs from "dayjs";
import { ITable } from "../../../interfaces/common/common";
import { IncidentWithRelations } from "../../../interfaces/requests/incident";
import { EIncidentDirection } from "../../../enums/incident";
import { Button, Space, Tag } from "antd";
import classes from "../Home.module.scss";
import { ObjectType } from "../../../enums/object";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";
export const usePrepareTableData = (data: ITable<IncidentWithRelations>) => {
  const navigate = useNavigate();
  
  const handleEditIncident = (id: string) => {
    navigate(ERoutes.INCIDENT_CREATE + `/${id}`);
  };

  const columnsData = data?.columns.map((column) => {
    if (column.dataIndex === "incidents") {
      return {
        ...column,
        render: (value: any, record: any) => {
          return record.events?.map((item: any) => (
            <Tag color="blue" className={classes.tag}>
              {item?.event_type?.name}
            </Tag>
          ));
        },
      };
    }

    if (column.dataIndex === "object") {
      return {
        ...column,
        render: (value: any, record: any) => {
          return (
            <Tag color="blue" className={classes.tag}>
              {record?.object?.type === ObjectType.BS
                ? "БС"
                : record?.object?.type === ObjectType.OFFICE_MTS
                  ? "офис МТС"
                  : record?.object?.type === ObjectType.CATEGORIZED_ROOM
                    ? "Категорированное помещение"
                    : record?.object?.type === ObjectType.OTHER_PROPERTY
                      ? "Иное имущество"
                      : record?.object?.type === ObjectType.PERSONNEL
                        ? "Персонал"
                        : ""}
            </Tag>
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
          <div className={classes.actions}>
              <Button type="primary" onClick={() => handleEditIncident(record.id)}>
                <EditOutlined  />
              </Button>
              <Button type="primary" danger>
                <DeleteOutlined />
              </Button>
          </div>
        );
      },
    },
  ];

  const dataSource = data?.dataSource?.map((item) => ({
    ...item,
    createdAt: dayjs(item.createdAt).format("DD.MM.YYYY"),
    direction:
      item.direction === EIncidentDirection.INFORMATION
        ? "ИБ"
        : item.direction === EIncidentDirection.ECONOMIC
          ? "ЭБ"
          : item.direction === EIncidentDirection.SECURITY
            ? "БПиО"
            : "",
    department: item.department?.name,
  }));

  return {
    columns: [...(columnsData ?? []), ...columnActions],
    dataSource: dataSource ?? [],
  };
};
