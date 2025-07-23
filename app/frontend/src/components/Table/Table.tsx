import { Table as AntTable, Empty, TableProps } from "antd";

export const Table = (props: TableProps) => {
  return (
    <AntTable
      {...props}
      locale={{
        emptyText: <Empty description="Нет данных" />,
      }}
    />
  );
};
