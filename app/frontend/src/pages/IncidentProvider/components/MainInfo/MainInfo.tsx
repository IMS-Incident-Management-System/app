import { Form, Select, TreeSelect, DatePicker, Input, Row, Col, Card, Divider } from "antd";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import { useGetObjectTypes } from "../../../../services/requests/objectTypes/getObjectTypes";
import { useGetEventTypes } from "../../../../services/requests/eventTypes/getEventTypes";
import { SecurityDirectionEnum } from "../../../../enums/direction";
import styles from "./MainInfo.module.scss";
import { CreateIncidentBody } from "../../../../interfaces/requests/incident";
import { directionDict } from "../../../../constants/incidentDict";
import dayjs from "dayjs";

export const MainInfo = () => {
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();
  const { data: objectTypes, isLoading: isObjectTypesLoading } =
    useGetObjectTypes();
  const { data: eventTypes, isLoading: isEventTypesLoading } =
    useGetEventTypes();

  return (
    <div className={styles.container}>
      {/* Основная информация */}
      <Card className={styles.sectionCard} title="Основная информация">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
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
          </Col>
          <Col xs={24} sm={12} lg={8}>
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
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Тип объекта"
              name="object_type_id"
            >
              <TreeSelect
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                placeholder="Выберите тип объекта"
                allowClear
                treeDefaultExpandAll
                treeData={objectTypes?.treeData}
                loading={isObjectTypesLoading}
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Информация о событии */}
      <Card className={styles.sectionCard} title="Информация о событии">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Типы событий"
              name={["event", "event_type_ids"]}
              rules={[
                { required: true, message: "Выберите типы событий" },
              ]}
            >
              <TreeSelect
                showSearch
                multiple
                treeCheckable
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                placeholder="Выберите типы событий"
                allowClear
                treeDefaultExpandAll
                treeData={eventTypes?.treeData}
                loading={isEventTypesLoading}
                className={styles.formInput}
                maxTagCount="responsive"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Дата события"
              name={["event", "date"]}
              rules={[
                { required: true, message: "Укажите дату события" },
              ]}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                placeholder="Выберите дату события"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Дата внесения"
              name={["event", "entry_date"]}
              initialValue={dayjs()}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                disabled 
                placeholder="Сегодняшняя дата"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Адрес события</Divider>
        
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Город"
              name={["event", "city"]}
            >
              <Input placeholder="Введите город" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Улица"
              name={["event", "street"]}
            >
              <Input placeholder="Введите улицу" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Дом"
              name={["event", "house"]}
            >
              <Input placeholder="Введите номер дома" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Корпус"
              name={["event", "building"]}
            >
              <Input placeholder="Введите корпус" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Персональные данные</Divider>
        
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Фамилия"
              name={["event", "last_name"]}
            >
              <Input placeholder="Введите фамилию" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Имя"
              name={["event", "first_name"]}
            >
              <Input placeholder="Введите имя" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Отчество"
              name={["event", "middle_name"]}
            >
              <Input placeholder="Введите отчество" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Табельный номер"
              name={["event", "employee_number"]}
            >
              <Input placeholder="Введите табельный номер" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
