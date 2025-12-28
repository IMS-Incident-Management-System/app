import React, { useState, useMemo, useCallback } from "react";
import { Form, Card, Row, Col, DatePicker, TreeSelect, Select, Button, message, Spin, Space, Dropdown } from "antd";
import { CheckSquareOutlined, AppstoreOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { useGetDepartments } from "../../services/requests/departments/getDepartments";
import { getAvailableFields, generateReport, ReportField } from "../../api/reports/reports";
import { useQuery } from "react-query";
import dayjs, { Dayjs } from "dayjs";
import styles from "./Reports.module.scss";

const { RangePicker } = DatePicker;

interface ReportFormValues {
  dateRange: [Dayjs, Dayjs];
  departmentIds: number[];
  fieldKeys: string[];
}

export const Reports = () => {
  const [form] = Form.useForm<ReportFormValues>();
  const [loading, setLoading] = useState(false);
  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments();

  const { data: availableFields, isLoading: isFieldsLoading } = useQuery(
    'availableFields',
    async () => {
      const response = await getAvailableFields();
      return response;
    }
  );

  // Группируем поля по группам, подгруппам и подподгруппам для удобного отображения
  // Ant Design Select не поддерживает вложенные optGroup, поэтому делаем плоскую структуру
  const fieldOptions = React.useMemo(() => {
    if (!availableFields || availableFields.length === 0) {
      return [];
    }

    // Группируем по группам -> подгруппам -> подподгруппам (трехуровневая структура данных)
    // Map<groupKey, Map<subgroupKey, Map<subsubgroupKey, fields[]>>>
    const groupedByGroup = new Map<string, Map<string, Map<string, ReportField[]>>>();
    
    for (const field of availableFields) {
      const groupKey = field.group || '0';
      const subgroupKey = field.subgroup || '0';
      const subsubgroupKey = field.subsubgroup || '0';
      
      if (!groupedByGroup.has(groupKey)) {
        groupedByGroup.set(groupKey, new Map());
      }
      
      const groupMap = groupedByGroup.get(groupKey)!;
      if (!groupMap.has(subgroupKey)) {
        groupMap.set(subgroupKey, new Map());
      }
      
      const subgroupMap = groupMap.get(subgroupKey)!;
      if (!subgroupMap.has(subsubgroupKey)) {
        subgroupMap.set(subsubgroupKey, []);
      }
      
      subgroupMap.get(subsubgroupKey)!.push(field);
    }

    // Преобразуем в плоскую структуру для Ant Design Select (нельзя вкладывать optGroup в optGroup)
    const options: any[] = [];
    
    // Сортируем группы по ключу
    const sortedGroups = Array.from(groupedByGroup.entries()).sort((a, b) => {
      const numA = parseFloat(a[0]) || 0;
      const numB = parseFloat(b[0]) || 0;
      return numA - numB;
    });

    for (const [groupKey, subgroupsMap] of sortedGroups) {
      const firstField = availableFields.find((f: ReportField) => f.group === groupKey);
      const groupName = firstField?.groupName || `Группа ${groupKey}`;
      
      // Сортируем подгруппы по ключу
      const sortedSubgroups = Array.from(subgroupsMap.entries()).sort((a, b) => {
        const numA = parseFloat(a[0]) || 0;
        const numB = parseFloat(b[0]) || 0;
        return numA - numB;
      });

      for (const [subgroupKey, subsubgroupsMap] of sortedSubgroups) {
        // Находим первое поле этой подгруппы для получения названия
        const firstSubgroupField = availableFields.find(
          (f: ReportField) => f.group === groupKey && f.subgroup === subgroupKey
        );
        const subgroupName = firstSubgroupField?.subgroupName || `Подгруппа ${subgroupKey}`;
        
        // Собираем все поля из всех подподгрупп, сортируя по subsubgroup
        const sortedSubsubgroups = Array.from(subsubgroupsMap.entries()).sort((a, b) => {
          const numA = parseFloat(a[0]) || 0;
          const numB = parseFloat(b[0]) || 0;
          return numA - numB;
        });

        // Собираем все поля, сохраняя порядок по subsubgroup
        const allFields: ReportField[] = [];
        for (const [, fields] of sortedSubsubgroups) {
          allFields.push(...fields);
        }

        // Создаем опции из всех полей
        const subgroupOptions = allFields.map((field: ReportField) => ({
          label: field.label,
          value: `${field.entity}.${field.field}`,
          field: field,
        }));
        
        // Создаем optGroup для каждой подгруппы на верхнем уровне (не вложенные)
        // ВАЖНО: убеждаемся, что все поля попадают в опции
        // Сохраняем ключ подгруппы для возможности выбора всех опций в подгруппе
        if (subgroupOptions.length > 0) {
          const fullSubgroupKey = `${groupKey}.${subgroupKey}`;
          if (subgroupKey !== '0' && subgroupName) {
            // Создаем optGroup с названием подгруппы
            options.push({
              label: `${subgroupKey} - ${subgroupName}`,
              options: subgroupOptions,
              subgroupKey: fullSubgroupKey, // Сохраняем ключ для выбора всех
            });
          } else {
            // Если нет подгруппы, создаем optGroup с названием группы
            options.push({
              label: `${groupKey} - ${groupName}`,
              options: subgroupOptions,
              subgroupKey: fullSubgroupKey, // Сохраняем ключ для выбора всех
            });
          }
        }
      }
    }

    return options;
  }, [availableFields]);

  // Мемоизируем все значения полей по подгруппам для быстрого доступа
  const subgroupValuesMap = useMemo(() => {
    const map = new Map<string, string[]>();
    
    if (!availableFields || availableFields.length === 0) {
      return map;
    }

    for (const field of availableFields) {
      const groupKey = field.group || '0';
      const subgroupKey = field.subgroup || '0';
      const key = `${groupKey}.${subgroupKey}`;
      const value = `${field.entity}.${field.field}`;
      
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(value);
    }
    
    return map;
  }, [availableFields]);

  // Получаем все значения полей
  const allFieldValues = useMemo(() => {
    if (!availableFields || availableFields.length === 0) {
      return [];
    }
    return availableFields.map((field) => `${field.entity}.${field.field}`);
  }, [availableFields]);

  // Обработчик выбора всех полей в подгруппе
  const handleSelectSubgroup = useCallback((subgroupKey: string) => {
    const currentValues = form.getFieldValue('fieldKeys') || [];
    const subgroupValues = subgroupValuesMap.get(subgroupKey) || [];
    
    // Объединяем текущие значения с значениями подгруппы, удаляя дубликаты
    const newValues = Array.from(new Set([...currentValues, ...subgroupValues]));
    form.setFieldsValue({ fieldKeys: newValues });
  }, [subgroupValuesMap, form]);

  // Обработчик выбора/снятия всех полей (toggle)
  const handleSelectAll = useCallback(() => {
    const currentValues = form.getFieldValue('fieldKeys') || [];
    // Если все поля уже выбраны, снимаем выбор, иначе выбираем все
    const allSelected = allFieldValues.length > 0 && 
      allFieldValues.every(value => currentValues.includes(value));
    
    if (allSelected) {
      form.setFieldsValue({ fieldKeys: [] });
    } else {
      form.setFieldsValue({ fieldKeys: allFieldValues });
    }
  }, [allFieldValues, form]);

  // Создаем меню для Dropdown с подгруппами
  const subgroupMenuItems: MenuProps['items'] = useMemo(() => {
    return fieldOptions
      .filter((optGroup: any) => optGroup.options && optGroup.options.length > 0 && optGroup.subgroupKey)
      .map((optGroup: any) => ({
        key: optGroup.subgroupKey,
        label: optGroup.label,
        onClick: () => handleSelectSubgroup(optGroup.subgroupKey),
      }));
  }, [fieldOptions, handleSelectSubgroup]);

  const handleSubmit = async (values: ReportFormValues) => {
    if (!values.dateRange || values.dateRange.length !== 2) {
      message.error("Выберите диапазон дат");
      return;
    }

    if (!values.departmentIds || values.departmentIds.length === 0) {
      message.error("Выберите хотя бы один департамент");
      return;
    }

    if (!values.fieldKeys || values.fieldKeys.length === 0) {
      message.error("Выберите хотя бы одно поле");
      return;
    }

    try {
      setLoading(true);

      // Преобразуем выбранные поля обратно в объекты ReportField
      const selectedFields: ReportField[] = values.fieldKeys
        .map((key) => {
          const field = availableFields?.find(
            (f: ReportField) => `${f.entity}.${f.field}` === key
          );
          return field;
        })
        .filter((f): f is ReportField => f !== undefined);

      await generateReport({
        dateFrom: values.dateRange[0].format('YYYY-MM-DD'),
        dateTo: values.dateRange[1].format('YYYY-MM-DD'),
        departmentIds: values.departmentIds,
        fields: selectedFields,
      });

      message.success("Отчет успешно сформирован и скачан");
    } catch (error: any) {
      console.error("Error generating report:", error);
      message.error(error?.response?.data?.message || "Ошибка при формировании отчета");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Отчетность" />
      
      <Card className={styles.formCard}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            dateRange: [dayjs().startOf('month'), dayjs().endOf('month')],
          }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item<ReportFormValues>
                label="Период"
                name="dateRange"
                rules={[
                  { required: true, message: "Выберите период" },
                ]}
              >
                <RangePicker
                  style={{ width: "100%" }}
                  format="DD.MM.YYYY"
                  placeholder={["Дата начала", "Дата окончания"]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={16}>
              <Form.Item<ReportFormValues>
                label="Департаменты"
                name="departmentIds"
                rules={[
                  { required: true, message: "Выберите департаменты" },
                ]}
              >
                <TreeSelect
                  showSearch
                  multiple
                  treeCheckable
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                  placeholder="Выберите департаменты"
                  allowClear
                  treeDefaultExpandAll
                  treeData={departments?.treeData}
                  loading={isDepartmentsLoading}
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item<ReportFormValues>
                label="Поля для отчета"
                name="fieldKeys"
                rules={[
                  { required: true, message: "Выберите поля" },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Выберите поля для отчета"
                  loading={isFieldsLoading}
                  options={fieldOptions}
                  maxTagCount="responsive"
                  style={{ width: "100%" }}
                  dropdownStyle={{ maxHeight: 600, overflow: "auto" }}
                  showSearch
                  filterOption={(input, option) => {
                    // Поиск работает по label и по вложенным options
                    const label = option?.label?.toString().toLowerCase() || '';
                    const matchesLabel = label.includes(input.toLowerCase());
                    
                    // Проверяем вложенные опции (для группированных полей)
                    if (option?.options && Array.isArray(option.options)) {
                      const matchesOptions = option.options.some((opt: any) =>
                        opt.label?.toLowerCase().includes(input.toLowerCase())
                      );
                      return matchesLabel || matchesOptions;
                    }
                    
                    return matchesLabel;
                  }}
                  optionFilterProp="label"
                  dropdownRender={(menu) => (
                    <>
                      <div style={{ 
                        padding: '8px 12px', 
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        backgroundColor: '#fafafa'
                      }}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckSquareOutlined />}
                          onClick={handleSelectAll}
                          style={{ flexShrink: 0 }}
                        >
                          Выбрать все
                        </Button>
                        <Dropdown
                          menu={{ items: subgroupMenuItems }}
                          trigger={['click']}
                          placement="bottomLeft"
                        >
                          <Button
                            size="small"
                            icon={<AppstoreOutlined />}
                            style={{ flexShrink: 0 }}
                          >
                            Выбрать по группам
                          </Button>
                        </Dropdown>
                      </div>
                      {menu}
                    </>
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                >
                  Сформировать отчет
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

