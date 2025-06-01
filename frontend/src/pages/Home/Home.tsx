import { useSelector } from "react-redux";
import { useGetInitiators } from "../../services/requests/initiators/getInitiators";
import { selectUserSelector } from "../../store/features/user/selectors";
import { Button, Empty, Spin, Table } from "antd";
import styles from "./Home.module.scss";
import { useNavigate } from "react-router-dom";
import { FilterOutlined } from "@ant-design/icons";
import { useState } from "react";
import { FilterForm } from "./components/FilterForm/FilterForm";
import { TIncidentFilter } from "../../interfaces/requests/incident";
import { IUseGetRequest } from "../../interfaces/common/common";
import { usePrepareTableData } from "./hooks/usePrepareTableData";
import { ERoutes } from "../../enums/routes";

export const Home = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<IUseGetRequest<TIncidentFilter>>({
    filter: {},
    pagination: { page: 1, limit: 10 },
  });
  const [isFilterFormOpen, setIsFilterFormOpen] = useState(false);
  const { data, isLoading } = useGetInitiators(filter);
  const user = useSelector(selectUserSelector);
  const { columns, dataSource } = usePrepareTableData(data ?? {dataSource: [], columns: []});

  if (isLoading) {
    return <Spin />;
  }

  if (data?.dataSource.length === 0 && !isLoading) {
    return <Empty />;
  }

  const handleAddIncident = () => {
    navigate(ERoutes.INCIDENT_CREATE);
  };

  const toggleFilterForm = () => {
    setIsFilterFormOpen((prev) => !prev);
  };

  const handleFilter = (filter: TIncidentFilter) => {
    setFilter({ filter: { ...filter }, pagination: { page: 1, limit: 10 } });
  };

  return (
    <div>
      <div className={styles.header}>
        <h2>Инциденты</h2>
        <div className={styles.headerActions}>
          <Button icon={<FilterOutlined />} onClick={toggleFilterForm} type={isFilterFormOpen ? "primary" : "default"} />
          <Button type="primary" onClick={handleAddIncident}>
            Добавить инцидент
          </Button>
        </div>
      </div>
      {isFilterFormOpen && (
        <FilterForm filter={filter.filter} onFilter={handleFilter} />
      )}
      <Table dataSource={dataSource} columns={columns} className={styles.table} />
    </div>
  );
};
