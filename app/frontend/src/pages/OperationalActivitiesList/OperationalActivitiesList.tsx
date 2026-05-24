import type { TablePaginationConfig } from "antd/es/table";
import styles from "./OperationalActivitiesList.module.scss";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { FilterForm } from "./components/FilterForm/FilterForm";
import { TOperationalActivityFilter } from "../../interfaces/requests/operationalActivity";
import { IUseGetRequest } from "../../interfaces/common/common";
import { usePrepareTableData } from "./hooks/usePrepareTableData";
import { ERoutes } from "../../enums/routes";
import { queryClient } from "../../plugins/query";
import { EQueryKeys } from "../../enums/query";
import { Table } from "../../components/Table/Table";
import { useGetOperationalActivities } from "../../services/requests/operationalActivities/getOperationalActivities";
import { PageHeader } from "../../components/PageHeader";
import { IconButton } from "../../components/IconButton";
import { PrimaryButton } from "../../components/PrimaryButton";
import { selectCanCreateOperationalActivity } from "../../store/features/permissions/selectors";

export const OperationalActivitiesList = () => {
  const navigate = useNavigate();
  const canCreateOA = useSelector(selectCanCreateOperationalActivity);
  const [filter, setFilter] = useState<IUseGetRequest<TOperationalActivityFilter>>({
    filter: {},
    pagination: { page: 1, limit: 10 },
  });
  const [isFilterFormOpen, setIsFilterFormOpen] = useState(false);
  const { data, isLoading } = useGetOperationalActivities(filter);
  const { columns, dataSource } = usePrepareTableData(
    data ?? { dataSource: [], columns: [] },
  );

  const handleAddOperationalActivity = () => {
    navigate(ERoutes.OPERATIONAL_ACTIVITY_CREATE);
  };

  const toggleFilterForm = () => {
    setIsFilterFormOpen((prev) => !prev);
  };

  const handleFilter = (filter: TOperationalActivityFilter) => {
    setFilter({ filter: { ...filter }, pagination: { page: 1, limit: 10 } });
  };

  const handleReload = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey[0] === EQueryKeys.GET_ALL_OPERATIONAL_ACTIVITIES
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
        title="Список операционной деятельности"
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
            {canCreateOA && (
              <PrimaryButton
                onClick={handleAddOperationalActivity}
                icon={<PlusOutlined />}
              >
                Добавить операционную деятельность
              </PrimaryButton>
            )}
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


