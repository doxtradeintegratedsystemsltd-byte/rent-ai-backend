import { DataSource } from 'typeorm';
import dbConfig from './dbConf';

export const dataSource = new DataSource(dbConfig);

export const initializeDataSource = async () => {
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('Data Source has been initialized!');
    }
    return dataSource;
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    throw err;
  }
};
