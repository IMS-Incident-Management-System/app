import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const sequelize = new Sequelize(
  process.env.POSTGRES_DB ?? 'iml',
  process.env.POSTGRES_USER ?? 'admin',
  process.env.POSTGRES_PASSWORD ?? 'admin',
  {
    host: 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    dialect: 'postgres',

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

sequelize.authenticate();
