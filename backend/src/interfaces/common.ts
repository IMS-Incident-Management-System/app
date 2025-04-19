import * as Sequelize from 'sequelize';

export type IModel<Q = any, T extends {} = any> = Sequelize.Model<IModel, T> &
  Q;
