import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ReloadOutlined,
} from "@ant-design/icons";
import type { TablePaginationConfig } from "antd/es/table";
import { DatePicker, Card } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import localeData from "dayjs/plugin/localeData";

dayjs.locale("ru");
dayjs.extend(localeData);
import { useGetExplanatoryNotes } from "../../services/requests/explanatoryNotes/getExplanatoryNotes";
import { ExplanatoryNoteFilter } from "../../api/explanatoryNotes/explanatoryNotes";
import { IUseGetRequest } from "../../interfaces/common/common";
import { ERoutes } from "../../enums/routes";
import { queryClient } from "../../plugins/query";
import { EQueryKeys } from "../../enums/query";
import { Table } from "../../components/Table/Table";
import { PageHeader } from "../../components/PageHeader";
import { IconButton } from "../../components/IconButton";
import { ExplanatoryNote } from "../../api/explanatoryNotes/explanatoryNotes";
import { ColumnsType } from "antd/es/table";
import styles from "./ExplanatoryNotesList.module.scss";

const { RangePicker } = DatePicker;

export const ExplanatoryNotesList = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [filter, setFilter] = useState<IUseGetRequest<ExplanatoryNoteFilter>>({
    filter: {
      period_from: dateRange[0].format("YYYY-MM-DD"),
      period_to: dateRange[1].format("YYYY-MM-DD"),
    },
    pagination: { page: 1, limit: 10 },
  });
  
  const { data, isLoading } = useGetExplanatoryNotes(filter);

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
      setFilter((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          period_from: dates[0].format("YYYY-MM-DD"),
          period_to: dates[1].format("YYYY-MM-DD"),
        },
        pagination: { page: 1, limit: prev.pagination.limit },
      }));
    }
  };

  const handleReload = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey[0] === EQueryKeys.GET_ALL_EXPLANATORY_NOTES
        );
      },
    });
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (
      typeof pagination.current === "number" &&
      typeof pagination.pageSize === "number"
    ) {
      const page = pagination.current;
      const limit = pagination.pageSize;

      setFilter((prev) => ({
        ...prev,
        pagination: { page, limit },
      }));
    }
  };

  const formatPeriod = (periodFrom: string, periodTo: string) => {
    const from = dayjs(periodFrom);
    const to = dayjs(periodTo);
    if (from.format("YYYY-MM") === to.format("YYYY-MM")) {
      return from.format("MMMM YYYY").replace(/^\w/, (c) => c.toUpperCase());
    }
    return `${from.format("DD.MM.YYYY")} - ${to.format("DD.MM.YYYY")}`;
  };

  const columns: ColumnsType<ExplanatoryNote> = useMemo(() => [
    {
      title: "№",
      dataIndex: "number",
      key: "number",
      width: 80,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "КЦ/Р",
      dataIndex: "kc_r",
      key: "kc_r",
      width: 100,
    },
    {
      title: "P",
      dataIndex: "p",
      key: "p",
      width: 60,
    },
    {
      title: "Период",
      key: "period",
      width: 150,
      render: (_: unknown, record: ExplanatoryNote) =>
        formatPeriod(record.period_from, record.period_to),
    },
    {
      title: "Дата",
      dataIndex: "entry_date",
      key: "entry_date",
      width: 120,
      render: (date: string) => (date ? dayjs(date).format("DD.MM.YYYY") : ""),
    },
    {
      title: "Информация о событии",
      dataIndex: "event_info",
      key: "event_info",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Кол-во СП СР",
      dataIndex: "service_investigation_count",
      key: "service_investigation_count",
      width: 120,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во СП ИБ",
      dataIndex: "service_check_ib_count",
      key: "service_check_ib_count",
      width: 120,
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
      width: 130,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во уволено",
      dataIndex: "dismissed_count",
      key: "dismissed_count",
      width: 130,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во передано материалов",
      dataIndex: "materials_transferred_count",
      key: "materials_transferred_count",
      width: 200,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Кол-во возбуждено УД/АД",
      dataIndex: "cases_initiated_count",
      key: "cases_initiated_count",
      width: 180,
      render: (value: number) => value ?? 0,
    },
    {
      title: "Выявлен ущерб, руб.",
      dataIndex: "detected_damage",
      key: "detected_damage",
      width: 150,
      render: (value: number) => (value ?? 0).toLocaleString("ru-RU"),
    },
    {
      title: "Возмещен ущерб, руб.",
      dataIndex: "recovered_damage",
      key: "recovered_damage",
      width: 150,
      render: (value: number) => (value ?? 0).toLocaleString("ru-RU"),
    },
    {
      title: "Возмещена ДЗ, руб.",
      dataIndex: "recovered_receivables",
      key: "recovered_receivables",
      width: 150,
      render: (value: number) => (value ?? 0).toLocaleString("ru-RU"),
    },
    {
      title: "Предотвращен ущерб, руб.",
      dataIndex: "prevented_damage",
      key: "prevented_damage",
      width: 180,
      render: (value: number) => (value ?? 0).toLocaleString("ru-RU"),
    },
    {
      title: "Снижена стоимость закупки, договора, доп.согл., руб.",
      dataIndex: "reduced_cost",
      key: "reduced_cost",
      width: 300,
      render: (value: number) => (value ?? 0).toLocaleString("ru-RU"),
    },
    {
      title: "Предотвращен о необ. списание ДЗ, руб.",
      dataIndex: "prevented_writeoff_receivables",
      key: "prevented_writeoff_receivables",
      width: 250,
      render: (value: number) => (value ?? 0).toLocaleString("ru-RU"),
    },
    {
      title: "Получен доп. доход, руб.",
      dataIndex: "additional_income",
      key: "additional_income",
      width: 180,
      render: (value: number) => (value ?? 0).toLocaleString("ru-RU"),
    },
    {
      title: "Принят к вычету НДС, руб.",
      dataIndex: "vat_deducted",
      key: "vat_deducted",
      width: 180,
      render: (value: number) => (value ?? 0).toLocaleString("ru-RU"),
    },
  ], []);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Пояснительная записка"
        actions={
          <IconButton
            buttonStyle="glass"
            icon={<ReloadOutlined />}
            onClick={handleReload}
            tooltip="Обновить"
          />
        }
      />
      <Card className={styles.filterCard}>
        <div className={styles.dateRangeContainer}>
          <label>Период:</label>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD.MM.YYYY"
            style={{ width: 300 }}
          />
        </div>
      </Card>
      <Table<ExplanatoryNote>
        dataSource={data?.dataSource ?? []}
        columns={columns}
        className={styles.table}
        pagination={{
          current: filter.pagination.page,
          pageSize: filter.pagination.limit,
          total: data?.total ?? 0,
        }}
        onChange={(pagination) => handleTableChange(pagination)}
        loading={isLoading}
        scroll={{ x: "max-content" }}
        rowKey="id"
      />
    </div>
  );
};
