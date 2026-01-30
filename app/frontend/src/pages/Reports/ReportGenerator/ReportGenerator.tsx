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

/** Ячейка иерархической шапки (бэкенд) */
interface ReportHeaderCell {
  label: string;
  span: number;
}

interface ReportTableResponse {
  rows: ReportTableRow[];
  departments: Array<{ id: number; name: string }>;
  total: number;
  paoMtsDepartmentIds?: number[];
  allSelectedArePaoMts?: boolean;
  headerRows?: ReportHeaderCell[][];
}

function formatCellValue(value: string | number): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "number") {
    return value.toLocaleString("ru-RU");
  }
  return String(value);
}

/** Тип колонки таблицы (Ant Design ожидает вложенные children для многострочной шапки) */
type ReportColumnType = {
  key: string;
  title: React.ReactNode;
  dataIndex?: string;
  width?: number;
  align?: "left" | "right" | "center";
  fixed?: "left" | "right";
  className?: string;
  children?: ReportColumnType[];
  render?: (value: unknown, record: ReportTableRow) => React.ReactNode;
  ellipsis?: boolean;
};

/** Строит колонки департаментов из headerRows (вложенные children = несколько строк заголовка) */
function buildDepartmentColumns(
  headerRows: ReportHeaderCell[][],
  deptList: Array<{ id: number; name: string }>,
  rowIndex: number,
  rangeStart: number,
  rangeEnd: number,
  selectedDepartments: Set<number>,
  onDepartmentToggle: (id: number, checked: boolean) => void,
  styles: Record<string, string>
): ReportColumnType[] {
  const L = headerRows.length;
  // На последнем уровне headerRows сразу отдаём листовые колонки (чекбокс + название), без лишней строки заголовка
  if (rowIndex >= L - 1) {
    return deptList.slice(rangeStart, rangeEnd).map((dept) => ({
      key: `dept_${dept.id}`,
      title: (
        <div className={styles.columnHeader}>
          <Space>
            <Checkbox
              checked={selectedDepartments.has(dept.id)}
              onChange={(e) => onDepartmentToggle(dept.id, e.target.checked)}
            />
            <span>{dept.name}</span>
          </Space>
        </div>
      ),
      dataIndex: `dept_${dept.id}`,
      width: 140,
      align: "right" as const,
      className: selectedDepartments.has(dept.id) ? styles.selectedCol : undefined,
      render: (value: unknown) => (
        <span className={styles.cellValue}>{formatCellValue(value as number | string)}</span>
      ),
    }));
  }
  const row = headerRows[rowIndex];
  let pos = 0;
  const result: ReportColumnType[] = [];
  for (const cell of row) {
    const cellStart = pos;
    const cellEnd = pos + cell.span;
    pos = cellEnd;
    if (cellEnd <= rangeStart || cellStart >= rangeEnd) continue;
    result.push({
      key: `h${rowIndex}-${cell.label}-${cellStart}`,
      title: cell.label,
      align: "center",
      children: buildDepartmentColumns(
        headerRows,
        deptList,
        rowIndex + 1,
        cellStart,
        cellEnd,
        selectedDepartments,
        onDepartmentToggle,
        styles
      ),
    });
  }
  return result;
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

  const onDepartmentToggle = useCallback((id: number, checked: boolean) => {
    setSelectedDepartments((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const headerRows = tableData?.headerRows;
  const useHierarchy = !!(headerRows && headerRows.length > 0 && deptList.length > 0);

  // Отладка: что пришло с бэкенда и какая структура колонок
  useEffect(() => {
    if (!tableData) return;
    console.log("[ReportGenerator] headerRows from API:", {
      length: headerRows?.length ?? 0,
      rows: headerRows?.map((r, i) => ({ rowIndex: i, cellCount: r.length, cells: r.slice(0, 5) })),
    });
  }, [tableData, headerRows]);

  const tableColumns: ReportColumnType[] = useMemo(() => {
    const indicatorCol: ReportColumnType = {
      key: "fieldName",
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
                if (e.target.checked) setSelectedFields(new Set(rows.map((r) => r.fieldKey)));
                else setSelectedFields(new Set());
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
      width: 260,
      ellipsis: true,
      render: (_: unknown, record: ReportTableRow) => (
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
          <span title={record.fieldName}>{record.fieldName}</span>
        </Space>
      ),
    };
    const deptCols: ReportColumnType[] = useHierarchy
      ? buildDepartmentColumns(
          headerRows!,
          deptList,
          0,
          0,
          deptList.length,
          selectedDepartments,
          onDepartmentToggle,
          styles
        )
      : deptList.map((dept) => ({
          key: `dept_${dept.id}`,
          title: (
            <div className={styles.columnHeader}>
              <Space>
                <Checkbox
                  checked={selectedDepartments.has(dept.id)}
                  onChange={(e) => onDepartmentToggle(dept.id, e.target.checked)}
                />
                <span>{dept.name}</span>
              </Space>
            </div>
          ),
          dataIndex: `dept_${dept.id}`,
          width: 140,
          align: "right" as const,
          className: selectedDepartments.has(dept.id) ? styles.selectedCol : undefined,
          render: (value: unknown) => (
            <span className={styles.cellValue}>{formatCellValue(value as number | string)}</span>
          ),
        }));
    const totalCols: ReportColumnType[] = [
      ...(!tableData?.allSelectedArePaoMts
        ? [
            {
              key: "total_gk_mts",
              title: "Итого ГК МТС",
              dataIndex: "total_gk_mts",
              width: 140,
              align: "right" as const,
              fixed: "right" as const,
              className: styles.totalColumn,
              render: (value: unknown) => (
                <span className={styles.totalValue}>{formatCellValue(value as number)}</span>
              ),
            } as ReportColumnType,
          ]
        : []),
      {
        key: "total_pao_mts",
        title: "Итого ПАО МТС",
        dataIndex: "total_pao_mts",
        width: 140,
        align: "right" as const,
        fixed: "right" as const,
        className: styles.totalColumn,
        render: (value: unknown) => (
          <span className={styles.totalValue}>{formatCellValue(value as number)}</span>
        ),
      },
    ];
    const result = [indicatorCol, ...deptCols, ...totalCols];
    // Отладка: структура колонок для многоуровневой шапки
    const firstDeptCol = deptCols[0];
    console.log("[ReportGenerator] tableColumns:", {
      totalColumns: result.length,
      deptColumnsCount: deptCols.length,
      useHierarchy,
      firstDeptCol: firstDeptCol
        ? {
            key: firstDeptCol.key,
            title: typeof firstDeptCol.title === "string" ? firstDeptCol.title : "(node)",
            hasChildren: !!firstDeptCol.children,
            childrenCount: firstDeptCol.children?.length ?? 0,
            firstChild: firstDeptCol.children?.[0]
              ? {
                  key: firstDeptCol.children[0].key,
                  hasChildren: !!firstDeptCol.children[0].children,
                }
              : null,
          }
        : null,
    });
    return result;
  }, [
    headerRows,
    deptList,
    useHierarchy,
    selectedDepartments,
    onDepartmentToggle,
    tableData?.allSelectedArePaoMts,
    selectedFields,
    rows,
    selectAllFields,
    clearAllFields,
    styles,
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
            <Table<ReportTableRow>
              dataSource={rows}
              columns={tableColumns}
              loading={isTableLoading || isExporting}
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
