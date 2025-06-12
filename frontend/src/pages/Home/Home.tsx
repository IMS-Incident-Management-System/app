import { useSelector } from "react-redux";
import { useGetInitiators } from "../../services/requests/initiators/getInitiators";
import { selectUserSelector } from "../../store/features/user/selectors";
import { Button, Empty, Spin, Table } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import styles from "./Home.module.scss";
import { useNavigate } from "react-router-dom";
import {
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { FilterForm } from "./components/FilterForm/FilterForm";
import { TIncidentFilter } from "../../interfaces/requests/incident";
import { IUseGetRequest } from "../../interfaces/common/common";
import { usePrepareTableData } from "./hooks/usePrepareTableData";
import { ERoutes } from "../../enums/routes";
import { queryClient } from "../../plugins/query";
import { EQueryKeys } from "../../enums/query";

export const Home = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<IUseGetRequest<TIncidentFilter>>({
    filter: {},
    pagination: { page: 1, limit: 10 },
  });
  const [isFilterFormOpen, setIsFilterFormOpen] = useState(false);
  const { data, isLoading } = useGetInitiators(filter);
  const user = useSelector(selectUserSelector);
  const { columns, dataSource } = usePrepareTableData(
    data ?? { dataSource: [], columns: [] },
  );

  const handleAddIncident = () => {
    navigate(ERoutes.INCIDENT_CREATE);
  };

  const toggleFilterForm = () => {
    setIsFilterFormOpen((prev) => !prev);
  };

  const handleFilter = (filter: TIncidentFilter) => {
    setFilter({ filter: { ...filter }, pagination: { page: 1, limit: 10 } });
  };

  const handleReload = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey[0] === EQueryKeys.GET_ALL_INITIATORS
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
      <div className={styles.header}>
        <h2>Список инцидентов</h2>
        <div className={styles.headerActions}>
          <Button
            icon={<FilterOutlined />}
            onClick={toggleFilterForm}
            type={isFilterFormOpen ? "primary" : "default"}
          />
          <Button icon={<ReloadOutlined />} onClick={handleReload} />
          <Button
            type="primary"
            onClick={handleAddIncident}
            icon={<PlusOutlined />}
          >
            Добавить инцидент
          </Button>
        </div>
      </div>
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
      />
    </div>
  );
};
