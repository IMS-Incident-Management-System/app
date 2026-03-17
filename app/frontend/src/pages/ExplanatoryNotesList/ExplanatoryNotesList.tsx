import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ReloadOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { DatePicker, Card, Button, Select, Tooltip, Table as AntTable } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import localeData from "dayjs/plugin/localeData";

dayjs.locale("ru");
dayjs.extend(localeData);
import { useGetExplanatoryNotes } from "../../services/requests/explanatoryNotes/getExplanatoryNotes";
import { ExplanatoryNoteFilter, ExplanatoryNoteFilterOptions, exportExplanatoryNotesToExcel } from "../../api/explanatoryNotes/explanatoryNotes";
import { IUseGetRequest } from "../../interfaces/common/common";
import { ERoutes } from "../../enums/routes";
import { Table } from "../../components/Table/Table";
import { PageHeader } from "../../components/PageHeader";
import { ColumnsType } from "antd/es/table";
import { ExplanatoryNoteRegisterRow } from "../../api/explanatoryNotes/explanatoryNotes";
import styles from "./ExplanatoryNotesList.module.scss";
import { selectCanExplanatoryNoteExport } from "../../store/features/permissions/selectors";

const { RangePicker } = DatePicker;

export const ExplanatoryNotesList = () => {
  const navigate = useNavigate();
  const canExport = useSelector(selectCanExplanatoryNoteExport);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [filter, setFilter] = useState<IUseGetRequest<ExplanatoryNoteFilter>>({
    filter: {
      period_from: dateRange[0].format("YYYY-MM-DD"),
      period_to: dateRange[1].format("YYYY-MM-DD"),
    },
    pagination: { page: 1, limit: 20000 },
  });
  
  const { data, isLoading, isFetching, refetch } = useGetExplanatoryNotes(filter);
  const [isExporting, setIsExporting] = useState(false);

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
      setFilter((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          period_from: dates[0]!.format("YYYY-MM-DD"),
          period_to: dates[1]!.format("YYYY-MM-DD"),
        },
        pagination: { page: 1, limit: prev.pagination.limit },
      }));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportExplanatoryNotesToExcel(filter.filter);
    } finally {
      setIsExporting(false);
    }
  };


  const filterOptions: ExplanatoryNoteFilterOptions = (data as { filterOptions?: ExplanatoryNoteFilterOptions })?.filterOptions ?? {
    kc_r: [],
    p: [],
    type: ['incident', 'event', 'additionally'],
    incident_type: [],
  };

  const handleFilterChange = (key: keyof ExplanatoryNoteFilter, value: string[] | undefined) => {
    setFilter((prev) => ({
      ...prev,
      filter: { ...prev.filter, [key]: value?.length ? value : undefined },
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const formatMoney = (value: unknown) => {
    const num =
      typeof value === "number"
        ? value
        : value !== null && value !== undefined
        ? Number(value)
        : 0;
    if (Number.isNaN(num)) return "0,00";
    return num.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const columns: ColumnsType<ExplanatoryNoteRegisterRow> = useMemo(() => [
    {
      title: "№",
      dataIndex: "number",
      key: "number",
      width: 60,
    },
    {
      title: "ID",
      dataIndex: "display_id",
      key: "display_id",
      width: 70,
      render: (displayId: string, record: ExplanatoryNoteRegisterRow) => {
        const eventId = (record as any).event_id as number | undefined;
        const incidentId = (record as any).incident_id as number | undefined;
        const href = eventId
          ? `${ERoutes.EVENT_VIEW}/${eventId}`
          : incidentId
            ? `${ERoutes.INCIDENT_VIEW}/${incidentId}`
            : null;
        if (href) {
          return <Link to={href}>{displayId}</Link>;
        }
        return displayId;
      },
    },
    {
      title: "КЦ/Р",
      dataIndex: "kc_r",
      key: "kc_r",
      width: 100,
    },
    {
      title: "Р",
      dataIndex: "p",
      key: "p",
      width: 120,
    },
    {
      title: "Период",
      dataIndex: "period",
      key: "period",
      width: 150,
      render: (period: string, record: ExplanatoryNoteRegisterRow) =>
        period || `${record.period_from ?? ""} - ${record.period_to ?? ""}`,
    },
    {
      title: "Дата",
      dataIndex: "entry_date",
      key: "entry_date",
      width: 110,
      render: (date: string) => (date ? dayjs(date).format("DD.MM.YYYY") : ""),
    },
    {
      title: "Тип",
      dataIndex: "typeLabel",
      key: "type",
      width: 140,
    },
    {
      title: "Тип инцидента",
      dataIndex: "incident_type",
      key: "incident_type",
      width: 120,
    },
    {
      title: "Информация о событии",
      dataIndex: "event_info",
      key: "event_info",
      width: 350,
      render: (text: string) => text ?? "",
    },
    {
      title: "Кол-во СР",
      dataIndex: "service_investigation_count",
      key: "service_investigation_count",
      width: 100,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во СП",
      dataIndex: "service_check_count",
      key: "service_check_count",
      width: 100,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во СП ИБ",
      dataIndex: "service_check_ib_count",
      key: "service_check_ib_count",
      width: 110,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во ПМ",
      dataIndex: "verification_activity_count",
      key: "verification_activity_count",
      width: 100,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во наказано",
      dataIndex: "punished_count",
      key: "punished_count",
      width: 120,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во уволено",
      dataIndex: "dismissed_count",
      key: "dismissed_count",
      width: 120,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во передано материалов",
      dataIndex: "materials_transferred_count",
      key: "materials_transferred_count",
      width: 180,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во возбуждено УД/АД",
      dataIndex: "cases_initiated_count",
      key: "cases_initiated_count",
      width: 170,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Выявлен ущерб, руб.",
      dataIndex: "detected_damage",
      key: "detected_damage",
      width: 150,
      render: (value: unknown) => formatMoney(value),
    },
    {
      title: "Возмещен ущерб, руб.",
      dataIndex: "recovered_damage",
      key: "recovered_damage",
      width: 150,
      render: (value: unknown) => formatMoney(value),
    },
    {
      title: "Возмещена ДЗ, руб.",
      dataIndex: "recovered_receivables",
      key: "recovered_receivables",
      width: 150,
      render: (value: unknown) => formatMoney(value),
    },
    {
      title: "Предотвращен ущерб, руб.",
      dataIndex: "prevented_damage",
      key: "prevented_damage",
      width: 170,
      render: (value: unknown) => formatMoney(value),
    },
    {
      title: "Снижена стоимость закупки, договора, доп.согл., руб.",
      dataIndex: "reduced_cost",
      key: "reduced_cost",
      width: 280,
      render: (value: unknown) => formatMoney(value),
    },
    {
      title: "Предотвращено необ. списание ДЗ, руб.",
      dataIndex: "prevented_writeoff_receivables",
      key: "prevented_writeoff_receivables",
      width: 240,
      render: (value: unknown) => formatMoney(value),
    },
    {
      title: "Получен доп. доход, руб.",
      dataIndex: "additional_income",
      key: "additional_income",
      width: 160,
      render: (value: unknown) => formatMoney(value),
    },
    {
      title: "Принят к вычету НДС, руб.",
      dataIndex: "vat_deducted",
      key: "vat_deducted",
      width: 160,
      render: (value: unknown) => formatMoney(value),
    },
  ], [formatMoney]);

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
        title="Пояснительная записка"
        actions={
          <Tooltip title="Обновить данные">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isFetching}
            >
              Обновить
            </Button>
          </Tooltip>
        }
      />
      <Card className={styles.filterCard}>
        <div className={styles.filtersRow}>
          {canExport && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={isExporting}
            >
              Выгрузить в Excel
            </Button>
          )}
          <div className={styles.dateRangeContainer}>
            <label>Период:</label>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD.MM.YYYY"
              style={{ width: 300 }}
            />
          </div>
          <div className={styles.filterItem}>
            <label>КЦ/Р:</label>
            <Select
              mode="multiple"
              placeholder="Все"
              allowClear
              value={filter.filter.kc_r ?? []}
              onChange={(v) => handleFilterChange("kc_r", v)}
              options={filterOptions.kc_r.map((o) => ({ label: o, value: o }))}
              style={{ width: 200 }}
            />
          </div>
          <div className={styles.filterItem}>
            <label>Р:</label>
            <Select
              mode="multiple"
              placeholder="Все"
              allowClear
              value={filter.filter.p ?? []}
              onChange={(v) => handleFilterChange("p", v)}
              options={filterOptions.p.map((o) => ({ label: o, value: o }))}
              style={{ width: 200 }}
            />
          </div>
          <div className={styles.filterItem}>
            <label>Тип:</label>
            <Select
              mode="multiple"
              placeholder="Все"
              allowClear
              value={filter.filter.type ?? []}
              onChange={(v) => handleFilterChange("type", v)}
              options={[
                { label: "инцидент", value: "incident" },
                { label: "событие", value: "event" },
                { label: "дополнение к инциденту", value: "additionally" },
              ]}
              style={{ width: 220 }}
            />
          </div>
          <div className={styles.filterItem}>
            <label>Тип инцидента:</label>
            <Select
              mode="multiple"
              placeholder="Все"
              allowClear
              value={filter.filter.incident_type ?? []}
              onChange={(v) => handleFilterChange("incident_type", v)}
              options={filterOptions.incident_type.map((o) => ({ label: o, value: o }))}
              style={{ width: 200 }}
            />
          </div>
        </div>
      </Card>
      <Table
        dataSource={data?.dataSource ?? []}
        columns={columns}
        className={styles.table}
        pagination={false}
        loading={isLoading}
        scroll={{ x: "max-content", y: 560 }}
        rowKey={(record) => `${record.type}-${record.id}`}
        summary={() => {
          const t = (data as { totals?: Record<string, number> })?.totals;
          if (!t) return null;
          const fmt = (v: number) => formatMoney(v);
          return (
            <AntTable.Summary fixed>
              <AntTable.Summary.Row>
                <AntTable.Summary.Cell index={0} colSpan={9}>
                  <strong>Итого</strong>
                </AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={9}>{t.service_investigation_count ?? 0}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={10}>{t.service_check_count ?? 0}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={11}>{t.service_check_ib_count ?? 0}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={12}>{t.verification_activity_count ?? 0}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={13}>{t.punished_count ?? 0}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={14}>{t.dismissed_count ?? 0}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={15}>{t.materials_transferred_count ?? 0}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={16}>{t.cases_initiated_count ?? 0}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={17}>{fmt(t.detected_damage)}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={18}>{fmt(t.recovered_damage)}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={19}>{fmt(t.recovered_receivables)}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={20}>{fmt(t.prevented_damage)}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={21}>{fmt(t.reduced_cost)}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={22}>{fmt(t.prevented_writeoff_receivables)}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={23}>{fmt(t.additional_income)}</AntTable.Summary.Cell>
                <AntTable.Summary.Cell index={24}>{fmt(t.vat_deducted)}</AntTable.Summary.Cell>
              </AntTable.Summary.Row>
            </AntTable.Summary>
          );
        }}
      />
    </div>
  );
};
