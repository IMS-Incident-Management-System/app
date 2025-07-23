export interface IPagination {
  page: number;
  limit: number;
}

export interface IUseGetRequest<TFilter> {
  filter: TFilter;
  pagination: IPagination;
}

export type ITable<T> = {
  dataSource: T[];
  columns: { key: string; title: string; dataIndex: string }[];
  total?: number;
};
