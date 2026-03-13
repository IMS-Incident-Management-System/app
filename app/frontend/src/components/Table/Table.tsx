import { Table as AntTable, Empty, TableProps } from "antd";

export const Table = <T extends object = any>(props: TableProps<T>) => {
  return (
    <AntTable<T>
      {...props}
      locale={{
        emptyText: <Empty description="Нет данных" />,
      }}
    />
  );
};
