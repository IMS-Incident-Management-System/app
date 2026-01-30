import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Space,
  Table,
  Checkbox,
  message,
  Empty,
  Skeleton,
  Tag,
  Tooltip,
} from "antd";
import {
  DownloadOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  CheckSquareOutlined,
  BorderOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { getReportTableData, exportReportToExcel } from "../../../api/reports/reports";
import { useQuery } from "react-query";
import { useGetDepartments } from "../../../services/requests/departments/getDepartments";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import styles from "./ReportGenerator.module.scss";
import { ERoutes } from "../../../enums/routes";

const { RangePicker } = DatePicker;

interface ReportTableRow {
  fieldName: string;
  fieldKey: string;
  total_gk_mts?: number;
  total_pao_mts?: number;
  [key: string]: string | number | undefined;
}

interface ReportTableResponse {
  rows: ReportTableRow[];
  departments: Array<{ id: number; name: string }>;
  total: number;
  paoMtsDepartmentIds?: number[];
}

function formatCellValue(value: string | number): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "number") {
    return value.toLocaleString("ru-RU");
  }
  return String(value);
}

export const ReportGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [selectedDepartments, setSelectedDepartments] = useState<Set<number>>(new Set());
  const [filterPaoMts, setFilterPaoMts] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 500 });
  const [isExporting, setIsExporting] = useState(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  // Получаем список всех департаментов для поиска ID департаментов ПАО МТС
  const { data: departmentsData } = useGetDepartments();
  
  // Названия основных департаментов ПАО МТС (те же, что на бэкенде)
  const PAO_MTS_DEPARTMENT_NAMES = ['КЦ', 'Москва', 'Центр', 'СЗ', 'Поволжье', 'ЕЦКБ', 'Юг', 'Урал', 'Сибирь', 'ДВ'];
  
  // Вычисляем ID департаментов ПАО МТС из списка всех департаментов
  const paoMtsDepartmentIdsArray = useMemo(() => {
    if (!departmentsData?.treeData || !Array.isArray(departmentsData.treeData)) {
      console.log('[ReportGenerator] Departments data not loaded yet');
      return [];
    }
    
    // Функция для рекурсивного поиска департаментов по названию в дереве
    const findDepartmentsByName = (depts: any[], names: string[]): number[] => {
      const ids: number[] = [];
      for (const dept of depts) {
        if (dept.title && names.includes(dept.title)) {
          ids.push(dept.department_id);
          console.log(`[ReportGenerator] Found PAO MTS department: ${dept.title} (ID: ${dept.department_id})`);
        }
        if (dept.children && Array.isArray(dept.children) && dept.children.length > 0) {
          ids.push(...findDepartmentsByName(dept.children, names));
        }
      }
      return ids;
    };
    
    const foundIds = findDepartmentsByName(departmentsData.treeData, PAO_MTS_DEPARTMENT_NAMES);
    console.log('[ReportGenerator] Found PAO MTS department IDs:', foundIds, 'from', PAO_MTS_DEPARTMENT_NAMES);
    return foundIds;
  }, [departmentsData?.treeData]);

  const {
    data: tableData,
    isLoading: isTableLoading,
    isFetching: isTableFetching,
    refetch: refetchTable,
  } = useQuery<ReportTableResponse>(
    ["reportTable", dateRange, pagination, filterPaoMts, paoMtsDepartmentIdsArray],
    async ({ signal }) => {
      if (!dateRange[0] || !dateRange[1]) {
        return { rows: [], departments: [], total: 0 };
      }
      
      // Если фильтр включен, но ID еще нет - не делаем запрос (ждем загрузки департаментов)
      if (filterPaoMts && paoMtsDepartmentIdsArray.length === 0) {
        return { rows: [], departments: [], total: 0 };
      }
      
      const departmentIdsToSend = filterPaoMts && paoMtsDepartmentIdsArray.length > 0 
        ? paoMtsDepartmentIdsArray 
        : undefined;
      
      console.log('[ReportGenerator] Making request', { 
        filterPaoMts, 
        paoMtsDepartmentIdsArrayLength: paoMtsDepartmentIdsArray.length,
        departmentIdsToSend 
      });
      
      return await getReportTableData(
        {
          dateFrom: dateRange[0].format("YYYY-MM-DD"),
          dateTo: dateRange[1].format("YYYY-MM-DD"),
          page: pagination.page,
          limit: pagination.limit,
          departmentIds: departmentIdsToSend,
        },
        signal
      );
    },
    { 
      enabled: !!dateRange[0] && !!dateRange[1],
      staleTime: 30000, // Данные считаются свежими 30 секунд
      cacheTime: 5 * 60 * 1000, // Кеш хранится 5 минут
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Не повторяем запрос при ошибках отмены
        if (error?.name === 'AbortError' || error?.name === 'CanceledError' || 
            error?.message?.includes('aborted') || error?.message?.includes('canceled') ||
            error?.code === 'ERR_CANCELED') {
          return false;
        }
        return failureCount < 2;
      },
      retryOnMount: false, // Не повторяем при монтировании, если была ошибка
    }
  );


  const rows = tableData?.rows ?? [];
  const total = tableData?.total ?? 0;
  const deptList = tableData?.departments ?? [];
  
  const hasFilters = !!dateRange[0] && !!dateRange[1];
  const isEmpty = hasFilters && !isTableLoading && rows.length === 0;

  const selectAllFields = useCallback(() => {
    if (rows.length === 0) return;
    const keys = new Set(rows.map((r) => r.fieldKey));
    setSelectedFields(keys);
    message.info(`Выбрано полей: ${keys.size}`);
  }, [rows]);

  const clearAllFields = useCallback(() => {
    setSelectedFields(new Set());
    message.info("Выбор полей сброшен");
  }, []);

  const selectAllDepartments = useCallback(() => {
    if (deptList.length === 0) return;
    const ids = new Set(deptList.map((d) => d.id));
    setSelectedDepartments(ids);
    message.info(`Выбрано департаментов: ${ids.size}`);
  }, [deptList]);

  const clearAllDepartments = useCallback(() => {
    setSelectedDepartments(new Set());
    message.info("Выбор департаментов сброшен");
  }, []);

  const columns: ColumnsType<ReportTableRow> = useMemo(() => {
    const cols: ColumnsType<ReportTableRow> = [
      {
        title: (
          <div className={styles.columnHeader}>
            <Space>
              <Checkbox
                checked={rows.length > 0 && rows.every((r) => selectedFields.has(r.fieldKey))}
                indeterminate={
                  rows.length > 0 &&
                  rows.some((r) => selectedFields.has(r.fieldKey)) &&
                  !rows.every((r) => selectedFields.has(r.fieldKey))
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFields(new Set(rows.map((r) => r.fieldKey)));
                  } else {
                    setSelectedFields(new Set());
                  }
                }}
              />
              <span>Название показателя</span>
            </Space>
            <Space size={4} className={styles.columnActions}>
              <Tooltip title="Выбрать все">
                <Button type="link" size="small" icon={<CheckSquareOutlined />} onClick={selectAllFields} />
              </Tooltip>
              <Tooltip title="Снять все">
                <Button type="link" size="small" icon={<BorderOutlined />} onClick={clearAllFields} />
              </Tooltip>
            </Space>
          </div>
        ),
        dataIndex: "fieldName",
        key: "fieldName",
        width: 260,
        ellipsis: true,
        render: (text: string, record: ReportTableRow) => (
          <Space className={styles.fieldCell}>
            <Checkbox
              checked={selectedFields.has(record.fieldKey)}
              onChange={(e) => {
                const next = new Set(selectedFields);
                if (e.target.checked) next.add(record.fieldKey);
                else next.delete(record.fieldKey);
                setSelectedFields(next);
              }}
            />
            <span title={text}>{text}</span>
          </Space>
        ),
      },
    ];

    deptList.forEach((dept) => {
      cols.push({
        title: (
          <div className={styles.columnHeader}>
            <Space>
              <Checkbox
                checked={selectedDepartments.has(dept.id)}
                onChange={(e) => {
                  const next = new Set(selectedDepartments);
                  if (e.target.checked) next.add(dept.id);
                  else next.delete(dept.id);
                  setSelectedDepartments(next);
                }}
              />
              <span>{dept.name}</span>
            </Space>
          </div>
        ),
        dataIndex: `dept_${dept.id}`,
        key: `dept_${dept.id}`,
        width: 140,
        align: "right",
        className: selectedDepartments.has(dept.id) ? styles.selectedCol : "",
        render: (value: number | string) => (
          <span className={styles.cellValue}>{formatCellValue(value)}</span>
        ),
      });
    });

    // Добавляем столбец "Итого ГК МТС" только если не все выбранные департаменты входят в ПАО МТС
    if (!tableData?.allSelectedArePaoMts) {
      cols.push({
        title: "Итого ГК МТС",
        dataIndex: "total_gk_mts",
        key: "total_gk_mts",
        width: 140,
        align: "right",
        fixed: "right",
        className: styles.totalColumn,
        render: (value: number) => (
          <span className={styles.totalValue}>{formatCellValue(value)}</span>
        ),
      });
    }

    // Столбец "Итого ПАО МТС" всегда отображается
    cols.push({
      title: "Итого ПАО МТС",
      dataIndex: "total_pao_mts",
      key: "total_pao_mts",
      width: 140,
      align: "right",
      fixed: "right",
      className: styles.totalColumn,
      render: (value: number) => (
        <span className={styles.totalValue}>{formatCellValue(value)}</span>
      ),
    });

    return cols;
  }, [
    tableData,
    selectedFields,
    selectedDepartments,
    rows,
    deptList,
    filterPaoMts, // Добавляем filterPaoMts, чтобы колонки пересоздавались при изменении фильтра
    selectAllFields,
    clearAllFields,
  ]);

  const rowClassName = useCallback(
    (record: ReportTableRow) =>
      selectedFields.has(record.fieldKey) ? styles.selectedRow : "",
    [selectedFields]
  );

  // Синхронизация горизонтального скролла шапки и тела таблицы (Ant Design рендерит их в разных контейнерах)
  useEffect(() => {
    if (!tableWrapperRef.current || !deptList.length) return;
    const wrapper = tableWrapperRef.current;
    let off: (() => void) | void;
    const timer = window.setTimeout(() => {
      const body = wrapper.querySelector(".ant-table-body") as HTMLElement | null;
      const header = wrapper.querySelector(".ant-table-header") as HTMLElement | null;
      if (!body || !header) return;
      const syncFromBody = () => {
        header.scrollLeft = body.scrollLeft;
      };
      const syncFromHeader = () => {
        body.scrollLeft = header.scrollLeft;
      };
      body.addEventListener("scroll", syncFromBody);
      header.addEventListener("scroll", syncFromHeader);
      off = () => {
        body.removeEventListener("scroll", syncFromBody);
        header.removeEventListener("scroll", syncFromHeader);
      };
    }, 100);
    return () => {
      window.clearTimeout(timer);
      off?.();
    };
  }, [deptList.length, rows.length]);

  const handleExport = async () => {
    if (selectedFields.size === 0 || selectedDepartments.size === 0) {
      message.warning("Выберите хотя бы один показатель и один департамент");
      return;
    }
    setIsExporting(true);
    try {
      await exportReportToExcel({
        dateFrom: dateRange[0].format("YYYY-MM-DD"),
        dateTo: dateRange[1].format("YYYY-MM-DD"),
        departmentIds: Array.from(selectedDepartments),
        fieldKeys: Array.from(selectedFields),
      });
      message.success("Отчёт выгружен");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Ошибка при выгрузке");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ERoutes.REPORTS)}
          className={styles.backBtn}
        >
          К отчётности
        </Button>
      </div>

      <PageHeader
        title="Генератор отчётности"
        actions={
          hasFilters && (
            <Tooltip title="Обновить данные">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetchTable()}
                loading={isTableFetching}
              >
                Обновить
              </Button>
            </Tooltip>
          )
        }
      />

      <Card className={styles.filtersCard} variant="borderless">
        <Row gutter={[24, 20]}>
          <Col xs={24} md={10} lg={8}>
            <label className={styles.filterLabel}>
              <CalendarOutlined /> Период
            </label>
            <RangePicker
              className={styles.rangePicker}
              format="DD.MM.YYYY"
              value={dateRange}
              onChange={(dates) => {
                if (dates?.[0] && dates?.[1]) setDateRange([dates[0], dates[1]]);
              }}
              placeholder={["Начало", "Окончание"]}
              allowClear={false}
            />
          </Col>
          <Col xs={24} md={10} lg={8}>
            <label className={styles.filterLabel}>
              Фильтры
            </label>
            <Space>
              <Checkbox
                checked={filterPaoMts}
                onChange={(e) => {
                  setFilterPaoMts(e.target.checked);
                  // При включении фильтра очищаем выбор департаментов, чтобы пользователь выбрал нужные из отфильтрованного списка
                  if (e.target.checked) {
                    setSelectedDepartments(new Set());
                  }
                }}
              >
                ПАО МТС
              </Checkbox>
            </Space>
          </Col>
        </Row>
      </Card>

      {!hasFilters && (
        <Card className={styles.emptyStateCard} variant="borderless">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Выберите <strong>период</strong>, чтобы загрузить таблицу показателей
              </span>
            }
          />
        </Card>
      )}

      {hasFilters && isTableLoading && (
        <Card className={styles.tableCard} variant="borderless">
          <Skeleton active paragraph={{ rows: 12 }} />
        </Card>
      )}

      {hasFilters && !isTableLoading && (
        <Card className={styles.tableCard} variant="borderless">
          <div className={styles.toolbar}>
            <Space wrap>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={isExporting}
                disabled={selectedFields.size === 0 || selectedDepartments.size === 0}
              >
                Выгрузить в Excel
              </Button>
              <Space split={<span className={styles.toolbarDivider}>|</span>}>
                <Tag color="blue">
                  Показателей: {selectedFields.size}
                  {total > 0 && ` / ${total}`}
                </Tag>
                <Tag color="green">
                  Департаментов: {selectedDepartments.size}
                  {deptList.length > 0 && ` / ${deptList.length}`}
                </Tag>
              </Space>
              <Space size={8}>
                <Button size="small" onClick={selectAllDepartments}>
                  Выбрать все департаменты
                </Button>
                <Button size="small" onClick={clearAllDepartments}>
                  Снять департаменты
                </Button>
              </Space>
            </Space>
          </div>

          {isEmpty ? (
            <Empty
              className={styles.tableEmpty}
              description="Нет данных за выбранный период"
            />
          ) : (
            <div ref={tableWrapperRef} className={styles.tableWrapper}>
            <Table
              columns={columns}
              dataSource={rows}
              loading={isTableFetching || isExporting}
              scroll={{ x: "max-content", y: 560 }}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total,
                showSizeChanger: true,
                pageSizeOptions: ["20", "50", "100", "500"],
                showTotal: (t) => `Всего показателей: ${t}`,
                onChange: (page, pageSize) => setPagination({ page, limit: pageSize ?? 500 }),
              }}
              rowClassName={rowClassName}
              rowKey="fieldKey"
              size="middle"
              className={styles.table}
            />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
