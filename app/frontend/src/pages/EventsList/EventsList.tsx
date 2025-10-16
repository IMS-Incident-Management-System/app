import type { TablePaginationConfig } from "antd/es/table";
import styles from "./EventsList.module.scss";
import { useNavigate } from "react-router-dom";
import {
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { FilterForm } from "./components/FilterForm/FilterForm";
import { TEventFilter } from "../../interfaces/requests/event";
import { IUseGetRequest } from "../../interfaces/common/common";
import { usePrepareTableData } from "./hooks/usePrepareTableData";
import { ERoutes } from "../../enums/routes";
import { queryClient } from "../../plugins/query";
import { EQueryKeys } from "../../enums/query";
import { Table } from "../../components/Table/Table";
import { useGetEvents } from "../../services/requests/events/getEvents";
import { PageHeader } from "../../components/PageHeader";
import { IconButton } from "../../components/IconButton";
import { PrimaryButton } from "../../components/PrimaryButton";

export const EventsList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<IUseGetRequest<TEventFilter>>({
    filter: {},
    pagination: { page: 1, limit: 10 },
  });
  const [isFilterFormOpen, setIsFilterFormOpen] = useState(false);
  const { data, isLoading } = useGetEvents(filter);
  const { columns, dataSource } = usePrepareTableData(
    data ?? { dataSource: [], columns: [] },
  );

  const handleAddEvent = () => {
    navigate(ERoutes.EVENT_CREATE);
  };

  const toggleFilterForm = () => {
    setIsFilterFormOpen((prev) => !prev);
  };

  const handleFilter = (filter: TEventFilter) => {
    setFilter({ filter: { ...filter }, pagination: { page: 1, limit: 10 } });
  };

  const handleReload = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey[0] === EQueryKeys.GET_ALL_EVENTS
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

  return (
    <div>
      <PageHeader
        title="Список событий"
        actions={
          <>
            <IconButton
              buttonStyle="glass"
              icon={<FilterOutlined />}
              onClick={toggleFilterForm}
              tooltip={isFilterFormOpen ? "Скрыть фильтры" : "Показать фильтры"}
            />
            <IconButton
              buttonStyle="glass"
              icon={<ReloadOutlined />}
              onClick={handleReload}
              tooltip="Обновить"
            />
            <PrimaryButton
              onClick={handleAddEvent}
              icon={<PlusOutlined />}
            >
              Добавить событие
            </PrimaryButton>
          </>
        }
      />
      {isFilterFormOpen && (
        <FilterForm filter={filter.filter} onFilter={handleFilter} />
      )}
      <Table
        dataSource={dataSource}
        columns={columns}
        className={styles.table}
        pagination={{
          current: filter.pagination.page,
          pageSize: filter.pagination.limit,
          total: data?.total ?? 0,
        }}
        onChange={(pagination) => handleTableChange(pagination)}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

