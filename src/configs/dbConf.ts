import { DataSourceOptions } from 'typeorm';
import { useContainer } from 'typeorm';
import { Container } from 'typedi';
import dotenv from 'dotenv';
import envConfig from './envConfig';

dotenv.config();

useContainer(Container);

const username = envConfig.DB_USERNAME;
const password = envConfig.DB_PASSWORD;
const host = envConfig.DB_HOST;
const database = envConfig.DB_NAME;
const port = envConfig.DB_PORT || 5432;

const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: [__dirname + '/../entities/*.+(ts|js)'],
  synchronize: true,
  logging: false,
  name: 'default',
};

export default dbConfig;
