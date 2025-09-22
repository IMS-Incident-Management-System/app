import dayjs from "dayjs";
import { ITable } from "../../../interfaces/common/common";
import { IncidentWithRelations } from "../../../interfaces/requests/incident";
import { EIncidentDirection } from "../../../enums/incident";
import { Button, Modal, Tag } from "antd";
import classes from "../Home.module.scss";
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
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
        render: (value: any, record: any) => {
          return record.events?.map((item: any) => (
            <Tag
              key={item.id || `${item.event_type?.event_type_id}-${item.event_type?.title}`}
              color="blue"
              className={classes.tag}
            >
              {item?.event_type?.title}
            </Tag>
          ));
        },
      };
    }




    if (column.dataIndex === "object_type") {
      return {
        ...column,
        render: (value: any, record: any) => {
          return (
            <Tag color="blue" className={classes.tag}>
              {record?.object_type?.title || ""}
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
            <Button
              type="text"
              onClick={() => handleEditIncident(record.id)}
              shape="circle"
              icon={<EditOutlined className={classes.icon} />}
              size="large"
              title="Редактировать инцидент"
            />
            <Button
              type="text"
              onClick={() => handleDuplicateIncident(record.id)}
              shape="circle"
              icon={
                <CopyOutlined
                  className={classNames(classes.icon, classes.iconDuplicate)}
                />
              }
              size="large"
              title="Дублировать инцидент"
            />
            <Button
              type="text"
              danger
              onClick={() => handleDeleteIncident(record.id)}
              shape="circle"
              icon={<DeleteOutlined className={classes.icon} />}
              size="large"
              title="Удалить инцидент"
            />
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
    department: item.department?.title,
    key: item.id + item.createdAt.toString(),
  }));

  return {
    columns: [...(columnsData ?? []), ...columnActions],
    dataSource: dataSource ?? [],
  };
};
