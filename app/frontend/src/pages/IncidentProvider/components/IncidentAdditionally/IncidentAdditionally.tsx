import { Form, Input, DatePicker, InputNumber, Button, Checkbox, Card, Row, Col, Divider, Space, Typography, Collapse } from "antd";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import styles from "./IncidentAdditionally.module.scss";
import dayjs from "dayjs";
import { PrimaryButton } from "../../../../components/PrimaryButton";
import { IncidentEventAttachments, IncidentEventAttachmentsRef } from "../IncidentEvents/IncidentEventAttachments";
import { IncidentEventAttachmentsView } from "../IncidentEvents/IncidentEventAttachmentsView";
import { AdditionallyAttributes } from "../../../../interfaces/requests/additionally";

const { Text } = Typography;

interface IncidentAdditionallyProps {
  incident?: any;
  isLoading?: boolean;
  /** Показывать кнопку удаления у вложений событий (право incident.attachments) */
  showDeleteAttachments?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export interface IncidentAdditionallyRef {
  uploadAllPendingFiles: (incidentId: number) => Promise<void>;
}

export const IncidentAdditionally = forwardRef<IncidentAdditionallyRef, IncidentAdditionallyProps>(
  ({ incident, isLoading, showDeleteAttachments = false, canCreate = true, canUpdate = true, canDelete = true }, ref) => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const form = Form.useFormInstance();
  const eventAttachmentsRefs = useRef<Record<number, IncidentEventAttachmentsRef>>({});
  // Сохраняем файлы по индексу дополнения для загрузки после обновления
  const pendingFilesByIndex = useRef<Record<number, File[]>>({});

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Экспортируем функцию для загрузки всех ожидающих файлов
  useImperativeHandle(ref, () => ({
    uploadAllPendingFiles: async (incidentId: number) => {
      const { queryClient } = await import("../../../../plugins/query");
      
      console.log('uploadAllPendingFiles called, current refs:', Object.keys(eventAttachmentsRefs.current));
      console.log('Current incident.additionally:', incident?.additionally?.map((a: any) => ({ id: a.id, eventId: a.incident_event_id })));
      
      // Собираем файлы из всех существующих refs
      const formAdditionally = form.getFieldValue('additionally') || [];
      console.log('Form additionally:', formAdditionally.map((a: any, i: number) => ({ index: i, id: a.id })));
      
      const filesByIndex: Array<{ index: number; files: File[] }> = [];
      
      // Проходим по всем дополнениям в форме и пытаемся найти файлы в refs
      formAdditionally.forEach((add: any, index: number) => {
        // Пытаемся найти eventId для этого дополнения через старый incident
        if (incident?.additionally) {
          const oldAdditionally = incident.additionally.find((a: any) => a.id === add.id);
          if (oldAdditionally?.incident_event_id) {
            const oldEventId = oldAdditionally.incident_event_id;
            console.log(`Looking for ref with eventId ${oldEventId} for addition ${add.id} at index ${index}`);
            const attachmentRef = eventAttachmentsRefs.current[oldEventId];
            if (attachmentRef) {
              const pendingFiles = attachmentRef.getPendingFiles();
              console.log(`Found ref for eventId ${oldEventId}, pending files: ${pendingFiles.length}`);
              if (pendingFiles.length > 0) {
                filesByIndex.push({ index, files: pendingFiles });
                console.log(`Added ${pendingFiles.length} files for addition at index ${index}`);
              }
            } else {
              console.log(`Ref not found for eventId ${oldEventId}`);
            }
          } else {
            console.log(`No eventId found for addition ${add.id} at index ${index}`);
          }
        }
      });

      if (filesByIndex.length === 0) {
        console.log('No files to upload for additions');
        return;
      }

      // Получаем обновленные данные инцидента из кеша
      const updatedIncidentResponse: any = queryClient.getQueryData(["getIncident", incidentId.toString()]);
      const updatedIncident = updatedIncidentResponse?.data || updatedIncidentResponse;
      
      if (!updatedIncident?.additionally) {
        console.warn('Incident data not found in cache after update, skipping file upload for additions');
        return;
      }

      console.log('Updated incident.additionally:', updatedIncident.additionally.map((a: any, i: number) => ({ index: i, id: a.id, eventId: a.incident_event_id })));

      // Загружаем файлы используя новые ID событий из обновленных данных
      const uploadPromises = filesByIndex.map(async ({ index, files }) => {
        // Находим дополнение в обновленных данных по индексу
        const updatedAdditionally = updatedIncident.additionally[index];
        
        if (!updatedAdditionally?.incident_event_id) {
          console.warn(`Event ID not found for addition at index ${index}, skipping file upload`);
          return;
        }

        const newEventId = updatedAdditionally.incident_event_id;
        
        try {
          console.log(`Uploading ${files.length} files for addition at index ${index} with new event ID ${newEventId}`);
          // Используем API напрямую для загрузки файлов с новым eventId
          const { uploadIncidentEventAttachments } = await import("../../../../api/incidents/incidentEventAttachments");
          await uploadIncidentEventAttachments(newEventId, files);
          
          console.log(`Successfully uploaded files for event ${newEventId}`);
          // Обновляем кеш для этого конкретного события
          await queryClient.refetchQueries({
            queryKey: ["incidentEventAttachments", newEventId],
            exact: true,
          });
        } catch (error: any) {
          console.error(`Error uploading files for addition at index ${index} (event ${newEventId}):`, error);
          // Не бросаем ошибку, чтобы другие файлы могли загрузиться
        }
      });
      
      console.log(`Starting upload for ${filesByIndex.length} additions`);
      await Promise.allSettled(uploadPromises);
      console.log('Finished uploading files for additions');
    },
  }));

  return (
    <div className={styles.container}>
      <Card 
        className={styles.sectionCard} 
        title="Дополнения к инциденту"
        extra={
          canCreate && (
            <Form.List name="additionally">
              {(_, { add }) => (
                <PrimaryButton
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Добавить дополнение
                </PrimaryButton>
              )}
            </Form.List>
          )
        }
      >
        <Form.List name="additionally">
          {(fields, { add, remove }) => (
            <>
              
              <div className={styles.additionallyContainer}>
                {fields.map((field, index) => (
                  <div key={field.key} className={styles.additionallyWrapper}>
                    <Collapse
                      size="small"
                      className={styles.additionallyCollapse}
                      items={[
                        {
                          key: '1',
                          label: (
                            <div className={styles.additionallyTitle}>
                              <Form.Item shouldUpdate noStyle>
                                {() => {
                                  const additionallyField = form.getFieldValue(['additionally', field.name]);
                                  const additionallyId = additionallyField?.id;
                                  let titleText = `Дополнение ${index + 1}`;
                                  
                                  if (additionallyId && incident?.additionally) {
                                    const additionally = incident.additionally.find((a: any) => a.id === additionallyId);
                                    if (additionally?.createdAt) {
                                      const createdAt = dayjs(additionally.createdAt);
                                      const dateStr = createdAt.format('DDMMYYYY');
                                      const timeStr = createdAt.format('HHmmss');
                                      titleText = `Дополнение-${dateStr}-${timeStr}`;
                                    }
                                  }
                                  
                                  return (
                                    <span className={styles.titleText}>{titleText}</span>
                                  );
                                }}
                              </Form.Item>
                              {canDelete && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    remove(field.name);
                                  }}
                                  className={styles.deleteButton}
                                >
                                  Удалить дополнение
                                </Button>
                              )}
                            </div>
                          ),
                          children: (
                            <Form.Item shouldUpdate noStyle>
                              {() => {
                                const additionallyField = form.getFieldValue(['additionally', field.name]);
                                const isExistingAdditionally = Boolean(additionallyField?.id);
                                const canEditCurrentAdditionally = isExistingAdditionally
                                  ? canUpdate
                                  : (canCreate || canUpdate);

                                return (
                                  <fieldset disabled={!canEditCurrentAdditionally} style={{ border: 'none', margin: 0, padding: 0 }}>
                            <div className={styles.additionallyContent}>

                    {/* Основные данные дополнения */}
                    <Card className={styles.subSectionCard} title="Основные данные">
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="Дата внесения дополнения"
                            name={[field.name, "addition_date"]}
                            initialValue={dayjs()}
                          >
                            <DatePicker 
                              style={{ width: "100%" }} 
                              disabled
                              placeholder="Сегодняшняя дата"
                              className={styles.formInput}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    {/* ФИО фигуранта */}
                    <Card className={styles.subSectionCard} title="ФИО фигуранта">
                      <Form.List name={[field.name, "persons"]}>
                        {(personFields, { add: addPerson, remove: removePerson }) => (
                          <>
                            {personFields.map((personField) => (
                              <Card
                                key={personField.key}
                                className={styles.listCard}
                                size="small"
                                title={`Фигурант ${personField.name + 1}`}
                                extra={
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removePerson(personField.name)}
                                  >
                                    Удалить
                                  </Button>
                                }
                              >
                                <Row gutter={[16, 16]}>
                                  <Col xs={24} sm={12} lg={6}>
                                    <Form.Item
                                      {...personField}
                                      label="Фамилия"
                                      name={[personField.name, "last_name"]}
                                    >
                                      <Input placeholder="Введите фамилию" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={6}>
                                    <Form.Item
                                      {...personField}
                                      label="Имя"
                                      name={[personField.name, "first_name"]}
                                    >
                                      <Input placeholder="Введите имя" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={6}>
                                    <Form.Item
                                      {...personField}
                                      label="Отчество"
                                      name={[personField.name, "middle_name"]}
                                    >
                                      <Input placeholder="Введите отчество" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={6}>
                                    <Form.Item
                                      {...personField}
                                      label="Дата рождения"
                                      name={[personField.name, "birth_date"]}
                                    >
                                      <DatePicker 
                                        style={{ width: "100%" }} 
                                        placeholder="Выберите дату рождения"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={6}>
                                    <Form.Item
                                      {...personField}
                                      label="Табельный номер"
                                      name={[personField.name, "employee_number"]}
                                    >
                                      <Input placeholder="Введите табельный номер" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Card>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => addPerson()}
                              icon={<PlusOutlined />}
                              style={{ width: "100%" }}
                            >
                              Добавить фигуранта
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Card>

                    {/* Дополнительная информация */}
                    <Card className={styles.subSectionCard} title="Дополнительная информация">
                      <Row gutter={[24, 16]}>
                        <Col xs={24}>
                          <Form.Item
                            label="Описание"
                            name={[field.name, "text_field"]}
                          >
                            <Input.TextArea 
                              rows={4} 
                              placeholder="Введите описание дополнения"
                              className={styles.textArea}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    {/* Уголовные / административные дела */}
                    <Card className={styles.subSectionCard} title="Уголовные / административные дела">
                      <div className={styles.criminalSection}>
                        <Divider orientation="left" plain>Передача материалов</Divider>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Дата передачи в ПРоО"
                              name={[field.name, "criminal_case", "transfer_date"]}
                              tooltip="Дата передачи материалов в правоохранительные органы"
                            >
                              <DatePicker style={{ width: "100%" }} placeholder="Выберите дату" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Номер документа/КУСП"
                              name={[field.name, "criminal_case", "document_number"]}
                              tooltip="Номер вх./исх. документа или Номер КУСП"
                            >
                              <Input placeholder="Введите номер" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Подразделение"
                              name={[field.name, "criminal_case", "department_name"]}
                              tooltip="Наименование подразделения, куда переданы материалы"
                            >
                              <Input placeholder="Название подразделения" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <div className={styles.criminalSection}>
                        <Divider orientation="left" plain>Рассмотрение материалов</Divider>
                        <Row gutter={[16, 16]}>
                          <Col xs={24}>
                            <Form.Item
                              label="Результат рассмотрения"
                              name={[field.name, "criminal_case", "review_result"]}
                            >
                              <Input.TextArea rows={2} placeholder="Опишите результат" />
                            </Form.Item>
                          </Col>
                          <Col xs={24}>
                            <Form.Item
                              label="Причина отказа"
                              name={[field.name, "criminal_case", "rejection_reason"]}
                              tooltip="Причина отказа в возбуждении УД/АД"
                            >
                              <Input.TextArea rows={2} placeholder="Укажите причину отказа" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Дата отказа"
                              name={[field.name, "criminal_case", "rejection_date"]}
                              tooltip="Дата отказа в возбуждении УД/АД"
                            >
                              <DatePicker style={{ width: "100%" }} placeholder="Выберите дату" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Дата обжалования"
                              name={[field.name, "criminal_case", "appeal_date"]}
                              tooltip="Дата обжалования отказа"
                            >
                              <DatePicker style={{ width: "100%" }} placeholder="Выберите дату" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <div className={styles.criminalSection}>
                        <Divider orientation="left" plain>Возбуждение дела</Divider>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Дата возбуждения"
                              name={[field.name, "criminal_case", "case_date"]}
                              tooltip="Дата возбуждения УД/АД"
                            >
                              <DatePicker style={{ width: "100%" }} placeholder="Выберите дату" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Номер дела"
                              name={[field.name, "criminal_case", "case_number"]}
                              tooltip="Номер УД/АД"
                            >
                              <Input placeholder="Введите номер" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Статья"
                              name={[field.name, "criminal_case", "law_article"]}
                              tooltip="Статья УКРФ/КоАПРФ"
                            >
                              <Input placeholder="Номер статьи" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Инициатор"
                              name={[field.name, "criminal_case", "initiator"]}
                              tooltip="Инициатор возбуждения УД/АД"
                            >
                              <Input placeholder="ФИО инициатора" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Задержано"
                              name={[field.name, "criminal_case", "detained_count"]}
                              tooltip="Задержано, человек"
                            >
                              <InputNumber style={{ width: "100%" }} min={0} placeholder="0" addonAfter="чел." />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={24} lg={8}>
                            <Form.Item
                              label="Субъект преступления"
                              name={[field.name, "criminal_case", "subject"]}
                              tooltip="Субъект преступления УД/АД"
                            >
                              <Input placeholder="Описание субъекта" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <div className={styles.criminalSection}>
                        <Divider orientation="left" plain>Привлекаемое лицо</Divider>
                        <Row gutter={[16, 16]}>
                          <Col xs={24}>
                            <Form.Item
                              label="ФИО / Название организации"
                              name={[field.name, "criminal_case", "person_name"]}
                              tooltip="ФИО лица или название юридического лица, привлекаемого к уголовной/административной ответственности"
                            >
                              <Input placeholder="Введите ФИО или название организации" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <div className={styles.criminalSection}>
                        <Divider orientation="left" plain>Результаты</Divider>
                        <Row gutter={[16, 16]}>
                          <Col xs={24}>
                            <Form.Item
                              label="Результат рассмотрения"
                              name={[field.name, "criminal_case", "case_result"]}
                              tooltip="Результат рассмотрения УД/АД"
                            >
                              <Input.TextArea rows={2} placeholder="Опишите результат рассмотрения" />
                            </Form.Item>
                          </Col>
                          <Col xs={24}>
                            <Form.Item
                              label="Решение суда"
                              name={[field.name, "criminal_case", "court_decision"]}
                              tooltip="Решение (приговор) суда"
                            >
                              <Input.TextArea rows={2} placeholder="Опишите решение или приговор" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item
                              label="Осуждено"
                              name={[field.name, "criminal_case", "convicted_count"]}
                              tooltip="Осуждено, человек"
                            >
                              <InputNumber style={{ width: "100%" }} min={0} placeholder="0" addonAfter="чел." />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    </Card>

                    {/* Наказание */}
                    <Card className={styles.subSectionCard} title="Наказание">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Установлено виновных лиц"
                            name={[field.name, "punishment", "guilty_persons_count"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Установлено сотрудников, причастных к инциденту"
                            name={[field.name, "punishment", "employees_involved_count"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Задержаны лица при совершении правонарушения"
                            name={[field.name, "punishment", "detained_persons_count"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Принято мер к виновным лицам"
                            name={[field.name, "punishment", "measures_taken_count"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Предупреждение предупредительным письмом по РП-398"
                            name={[field.name, "punishment", "warning_letter_rp398"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Замечание"
                            name={[field.name, "punishment", "remark"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Выговор"
                            name={[field.name, "punishment", "reprimand"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Уволено"
                            name={[field.name, "punishment", "dismissed_count"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    {/* Финансовый ущерб */}
                    <Card className={styles.subSectionCard} title="Финансовый ущерб">
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Выявлен ущерб (руб.)"
                            name={[field.name, "detected_damage"]}
                          >
                            <InputNumber<number>
                              style={{ width: "100%" }}
                              formatter={(value) => {
                                if (value === null || value === undefined) return "0";
                                const str = String(value).replace(/\./g, ",");
                                const [rawIntPart, rawDecimalPart] = str.split(",");
                                const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                                const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                return rawDecimalPart !== undefined && rawDecimalPart !== ""
                                  ? `${withSpaces},${rawDecimalPart}`
                                  : withSpaces;
                              }}
                              parser={(value) => {
                                if (!value) return 0;
                                const normalized = value
                                  .toString()
                                  .replace(/\s/g, "")
                                  .replace(/,/g, ".");
                                const result = parseFloat(normalized);
                                if (Number.isNaN(result)) return 0;
                                return Math.round(result * 100) / 100;
                              }}
                              placeholder="0"
                              className={styles.formInput}
                              addonAfter="₽"
                              min={0}
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Возмещен ущерб (руб.)"
                            name={[field.name, "recovered_damage"]}
                          >
                            <InputNumber<number>
                              style={{ width: "100%" }}
                              formatter={(value) => {
                                if (value === null || value === undefined) return "0";
                                const str = String(value).replace(/\./g, ",");
                                const [rawIntPart, rawDecimalPart] = str.split(",");
                                const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                                const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                return rawDecimalPart !== undefined && rawDecimalPart !== ""
                                  ? `${withSpaces},${rawDecimalPart}`
                                  : withSpaces;
                              }}
                              parser={(value) => {
                                if (!value) return 0;
                                const normalized = value
                                  .toString()
                                  .replace(/\s/g, "")
                                  .replace(/,/g, ".");
                                const result = parseFloat(normalized);
                                if (Number.isNaN(result)) return 0;
                                return Math.round(result * 100) / 100;
                              }}
                              placeholder="0"
                              className={styles.formInput}
                              addonAfter="₽"
                              min={0}
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Предотвращен ущерб (руб.)"
                            name={[field.name, "prevented_damage"]}
                          >
                            <InputNumber<number>
                              style={{ width: "100%" }}
                              formatter={(value) => {
                                if (value === null || value === undefined) return "0";
                                const str = String(value).replace(/\./g, ",");
                                const [rawIntPart, rawDecimalPart] = str.split(",");
                                const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                                const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                return rawDecimalPart !== undefined && rawDecimalPart !== ""
                                  ? `${withSpaces},${rawDecimalPart}`
                                  : withSpaces;
                              }}
                              parser={(value) => {
                                if (!value) return 0;
                                const normalized = value
                                  .toString()
                                  .replace(/\s/g, "")
                                  .replace(/,/g, ".");
                                const result = parseFloat(normalized);
                                if (Number.isNaN(result)) return 0;
                                return Math.round(result * 100) / 100;
                              }}
                              placeholder="0"
                              className={styles.formInput}
                              addonAfter="₽"
                              min={0}
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Получен дополнительный доход (руб.)"
                            name={[field.name, "additional_income"]}
                          >
                            <InputNumber<number>
                              style={{ width: "100%" }}
                              formatter={(value) => {
                                if (value === null || value === undefined) return "0";
                                const str = String(value).replace(/\./g, ",");
                                const [rawIntPart, rawDecimalPart] = str.split(",");
                                const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                                const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                return rawDecimalPart !== undefined && rawDecimalPart !== ""
                                  ? `${withSpaces},${rawDecimalPart}`
                                  : withSpaces;
                              }}
                              parser={(value) => {
                                if (!value) return 0;
                                const normalized = value
                                  .toString()
                                  .replace(/\s/g, "")
                                  .replace(/,/g, ".");
                                const result = parseFloat(normalized);
                                if (Number.isNaN(result)) return 0;
                                return Math.round(result * 100) / 100;
                              }}
                              placeholder="0"
                              className={styles.formInput}
                              addonAfter="₽"
                              min={0}
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Снижена стоимость товаров, работ и услуг на сумму (руб.)"
                            name={[field.name, "reduced_cost"]}
                          >
                            <InputNumber<number>
                              style={{ width: "100%" }}
                              formatter={(value) => {
                                if (value === null || value === undefined) return "";
                                const num = Number(value);
                                if (Number.isNaN(num)) return "";
                                const [intPart, decimalPart] = num.toFixed(2).split(".");
                                const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                return `${withSpaces},${decimalPart}`;
                              }}
                              parser={(value) => {
                                if (!value) return 0;
                                const normalized = value
                                  .toString()
                                  .replace(/\s/g, "")
                                  .replace(/,/g, ".");
                                const result = parseFloat(normalized);
                                if (Number.isNaN(result)) return 0;
                                return Math.round(result * 100) / 100;
                              }}
                              placeholder="0"
                              className={styles.formInput}
                              addonAfter="₽"
                              min={0}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    {/* Вложения */}
                    <Card className={styles.subSectionCard} title="Вложения">
                      <Form.Item shouldUpdate noStyle>
                        {() => {
                          // Если данные еще загружаются, не показываем форму
                          if (isLoading) {
                            return (
                              <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                                Сохраните дополнение, чтобы добавить вложения
                              </div>
                            );
                          }
                          
                          // Получаем дополнение из формы
                          const additionallyField = form.getFieldValue(['additionally', field.name]);
                          const additionallyId = additionallyField?.id;
                          
                          // Если дополнение еще не сохранено (нет ID), показываем сообщение
                          if (!additionallyId || !incident?.id) {
                            return (
                              <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                                Сохраните дополнение, чтобы добавить вложения
                              </div>
                            );
                          }
                          
                          // Находим дополнение в данных инцидента по ID
                          const additionally = incident.additionally?.find((a: AdditionallyAttributes) => a.id === additionallyId);
                          const eventId = additionally?.incident_event_id;
                          
                          // Если нет связанного события, показываем сообщение
                          if (!eventId) {
                            return (
                              <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                                Сохраните дополнение, чтобы добавить вложения
                              </div>
                            );
                          }
                          
                          return (
                            <>
                              <IncidentEventAttachments 
                                key={`attachments-${eventId}`}
                                incidentEventId={eventId}
                                ref={(el) => {
                                  if (el) {
                                    eventAttachmentsRefs.current[eventId] = el;
                                  } else {
                                    delete eventAttachmentsRefs.current[eventId];
                                  }
                                }}
                              />
                              <IncidentEventAttachmentsView
                                key={`attachments-view-${eventId}`}
                                incidentEventId={eventId}
                                showDelete={showDeleteAttachments}
                              />
                            </>
                          );
                        }}
                      </Form.Item>
                    </Card>
                            </div>
                                  </fieldset>
                                );
                              }}
                            </Form.Item>
                          ),
                        },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </Form.List>
      </Card>
    </div>
  );
});
