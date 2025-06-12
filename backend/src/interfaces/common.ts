import * as Sequelize from 'sequelize';

export type IModel<Q = any, T extends {} = any> = Sequelize.Model<IModel, T> &
  Q;

export type ITable<T> = {
  dataSource: T[];
  columns: { key: string; title: string; dataIndex: string }[];
  total: number;
  page: number;
  limit: number;
};
