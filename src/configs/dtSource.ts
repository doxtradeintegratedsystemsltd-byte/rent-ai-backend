import { DataSource } from 'typeorm';
import dbConfig from './dbConf';

export const AppDataSource = new DataSource(dbConfig);

export const initializeDataSource = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    throw err;
  }
};
