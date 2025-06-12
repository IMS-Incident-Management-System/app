import { Form, FormInstance, Select, TreeSelect } from "antd";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import { SecurityDirectionEnum } from "../../../../enums/direction";
import { usePrepareObjects } from "../../hooks/usePrepareObjects";
import styles from "./MainInfo.module.scss";
import { ObjectAttributes } from "../../../../interfaces/requests/object";
import { CreateIncidentBody } from "../../../../interfaces/requests/incident";
import { directionDict } from "../../../../constants/incidentDict";

export const MainInfo = ({
  objects,
  isObjectsLoading,
}: {
  objects: ObjectAttributes[];
  isObjectsLoading: boolean;
}) => {
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();

  const { objectOptions } = usePrepareObjects(objects);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Основная информация</h3>
      </div>
      <div className={styles.content}>
        <Form.Item<CreateIncidentBody>
          label="Департамент"
          name="department_id"
          rules={[
            { required: true, message: "Пожалуйста, выберите департамент" },
          ]}
        >
          <TreeSelect
            showSearch
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            placeholder="Выберите департамент"
            allowClear
            treeDefaultExpandAll
            treeData={departments?.treeData}
            loading={isDepartmentsLoading}
            className={styles.formInput}
          />
        </Form.Item>
        <Form.Item<CreateIncidentBody>
          label="Направление"
          name="direction"
          rules={[
            { required: true, message: "Пожалуйста, выберите направление" },
          ]}
        >
          <Select
            options={Object.values(SecurityDirectionEnum).map((direction) => ({
              label: directionDict[direction as SecurityDirectionEnum],
              value: direction,
            }))}
            placeholder="Выберите направление"
            allowClear
            className={styles.formInput}
          />
        </Form.Item>
        <Form.Item<CreateIncidentBody>
          label="Объект"
          name="object_id"
          rules={[{ required: true, message: "Пожалуйста, выберите объект" }]}
        >
          <Select
            options={objectOptions}
            placeholder="Выберите объект"
            allowClear
            loading={isObjectsLoading}
            className={styles.formInput}
          />
        </Form.Item>
      </div>
    </div>
  );
};
