import { useParams } from "react-router-dom";
import { useState } from "react";
import styles from "./incidentProvider.module.scss";
import { Checkbox, Form, Radio, DatePicker, Space, Button } from "antd";
import { getDepartments } from "../../api/initiators/getDepartments";
import { DepartmentSelect } from "./components/DepartmentSelect";
import { KtsSubDepartmentSelect } from "./components/KtsSubDepartmentSelect";
import { FoRegionSelect } from "./components/FoRegionSelect";
import { FoSubRegionSelect } from "./components/FoSubRegionSelect";
import { DzkDepartmentSelect } from "./components/DzkDepartmentSelect";
import { EtskbDepartmentSelect } from "./components/EtskbDepartmentSelect";
import { EventTypeSelect } from "./components/EventTypeSelect";
import { ObjectSelect } from "./components/ObjectSelect";
import { IncidentDetails } from "./components/IncidentDetails";
import { PunishmentDetails } from "./components/PunishmentDetails";
import { IncidentDescription } from "./components/IncidentDescription";
import { CriminalCaseModal } from "./components/CriminalCaseModal";

export const IncidentProvider = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [departmentType, setDepartmentType] = useState<string | null>(null);
  const [foRegion, setFoRegion] = useState<string | null>(null);
  const [subRegion, setSubRegion] = useState<string | null>(null);
  const [eventType, setEventType] = useState<string | null>(null);
  const [objectType, setObjectType] = useState<string | null>(null);
  const [uavOrArsonObjectType, setUavOrArsonObjectType] = useState<
    string | null
  >(null);
  const [isCriminalCaseModalVisible, setIsCriminalCaseModalVisible] =
    useState(false);

  const handleDepartmentTypeChange = (value: string) => {
    setDepartmentType(value);
    setFoRegion(null);
    setSubRegion(null);
    setEventType(null);
    setObjectType(null);
    setUavOrArsonObjectType(null);
    form.setFieldsValue({
      department: value,
      subDepartment: undefined,
      region: undefined,
      dzkDepartment: undefined,
      etskbDepartment: undefined,
      subRegion: undefined,
      eventType: undefined,
      object: undefined,
      uavOrArsonObject: undefined,
      theftSubType: undefined,
      damageAmount: undefined,
      compensatedAmount: undefined,
      isPunished: false,
      guiltyPersonsCount: undefined,
      measuresTakenCount: undefined,
      incidentDescription: undefined,
      bsNumber: undefined,
      bsAddress: undefined,
      officeNumber: undefined,
      officeAddress: undefined,
      premiseAddress: undefined,
      personnelFullName: undefined,
      personnelPosition: undefined,
      personnelId: undefined,
    });

    const guiltyCount = form.getFieldValue("guiltyPersonsCount") || 0;
    Array.from({ length: guiltyCount }).forEach((_, index) => {
      form.setFieldsValue({ [`punishment-${index}`]: undefined });
    });
  };

  const handleFoRegionChange = (value: string) => {
    setFoRegion(value);
    setSubRegion(null);
    form.setFieldsValue({ region: value, subRegion: undefined });
  };

  const handleSubRegionChange = (value: string) => {
    setSubRegion(value);
    form.setFieldsValue({ subRegion: value });
  };

  const handleEventTypeChange = (value: string) => {
    setEventType(value);
    setUavOrArsonObjectType(null);
    form.setFieldsValue({
      eventType: value,
      theftSubType: undefined,
      damageAmount: undefined,
      compensatedAmount: undefined,
      uavOrArsonObject: undefined,
      isPunished: false,
      guiltyPersonsCount: undefined,
      measuresTakenCount: undefined,
      incidentDescription: undefined,
      bsNumber: undefined,
      bsAddress: undefined,
      officeNumber: undefined,
      officeAddress: undefined,
      premiseAddress: undefined,
      personnelFullName: undefined,
      personnelPosition: undefined,
      personnelId: undefined,
    });
    // Сбрасываем динамические селекторы наказаний
    const guiltyCount = form.getFieldValue("guiltyPersonsCount") || 0;
    Array.from({ length: guiltyCount }).forEach((_, index) => {
      form.setFieldsValue({ [`punishment-${index}`]: undefined });
    });
  };

  const handleObjectTypeChange = (value: string) => {
    setObjectType(value);
    form.setFieldsValue({
      object: value,
      bsNumber: undefined,
      bsAddress: undefined,
      officeNumber: undefined,
      officeAddress: undefined,
      premiseAddress: undefined,
      personnelFullName: undefined,
      personnelPosition: undefined,
      personnelId: undefined,
    });
  };

  const handleUavOrArsonObjectTypeChange = (value: string) => {
    setUavOrArsonObjectType(value);
    form.setFieldsValue({
      uavOrArsonObject: value,
      bsNumber: undefined,
      bsAddress: undefined,
      officeNumber: undefined,
      officeAddress: undefined,
      premiseAddress: undefined,
      personnelFullName: undefined,
      personnelPosition: undefined,
      personnelId: undefined,
    });
  };

  const showCriminalCaseModal = () => {
    setIsCriminalCaseModalVisible(true);
  };

  const handleCriminalCaseOk = () => {
    setIsCriminalCaseModalVisible(false);
  };

  const handleCriminalCaseCancel = () => {
    setIsCriminalCaseModalVisible(false);
  };

  const getEventTypeLabel = (type: string | null): string => {
    switch (type) {
      case "Theft":
        return "Кража";
      case "Fire":
        return "Пожар/Возгорание";
      case "Damage":
        return "Повреждение имущества";
      case "UAV":
        return "БПЛА";
      case "Arson":
        return "Поджог";
      default:
        return "";
    }
  };

  const onFinish = (values: any) => {
    console.log("Form values:", values);
  };

  console.log(id);
  return (
    <>
      <div className={styles.header}>
        <h2>Инцидент</h2>
        <div className={styles.headerActions}></div>
      </div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className={styles.selectors}>
          <Form.Item name="importance" className={styles.formItem}>
            <Checkbox>Важно / Не важно</Checkbox>
          </Form.Item>

          <DepartmentSelect
            value={departmentType}
            onChange={handleDepartmentTypeChange}
          />
          <KtsSubDepartmentSelect visible={departmentType === "KTS"} />
          <FoRegionSelect
            value={foRegion}
            onChange={handleFoRegionChange}
            visible={departmentType === "FO"}
          />
          <FoSubRegionSelect
            visible={
              departmentType === "FO" &&
              foRegion !== null &&
              foRegion !== "Moscow"
            }
            region={foRegion}
            value={subRegion}
            onChange={handleSubRegionChange}
          />
          <DzkDepartmentSelect visible={departmentType === "DZK"} />
          <EtskbDepartmentSelect visible={departmentType === "ETSKB"} />
          <EventTypeSelect value={eventType} onChange={handleEventTypeChange} />
          <ObjectSelect value={objectType} onChange={handleObjectTypeChange} />
          <Form.Item
            name="direction"
            className={styles.formItem}
            label="Выбор направления"
          >
            <Radio.Group className={styles.radios}>
              <Radio value="type1">ИБ</Radio>
              <Radio value="type2">ЭБ</Radio>
              <Radio value="type3">БПиО</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            className={styles.formItem}
            name="date-ivent"
            label="Дата события"
          >
            <Space direction="vertical">
              <DatePicker
                className={styles.datePicker}
                placeholder="Дата события"
              />
            </Space>
          </Form.Item>

          <Form.Item
            className={styles.formItem}
            name="date-add-in-base"
            label="Дата внесения инцидента в базу"
          >
            <Space direction="vertical">
              <DatePicker
                className={styles.datePicker}
                placeholder="Дата внесения"
              />
            </Space>
          </Form.Item>

          {eventType && (
            <IncidentDetails
              eventType={getEventTypeLabel(eventType)}
              onOpenCriminalCase={showCriminalCaseModal}
            />
          )}
          {eventType && <PunishmentDetails form={form} />}
          {eventType && <IncidentDescription form={form} />}
        </div>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.buttonLust}
          >
            Отправить на согласование
          </Button>
        </Form.Item>
      </Form>
      <CriminalCaseModal
        visible={isCriminalCaseModalVisible}
        onOk={handleCriminalCaseOk}
        onCancel={handleCriminalCaseCancel}
      />
    </>
  );
};
