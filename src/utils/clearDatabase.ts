import { dataSource } from '../configs/dtSource';

export const dropAndRecreateDatabase = async () => {
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // Drop the entire schema (all tables)
    await dataSource.dropDatabase();
    console.log('Database schema dropped successfully');

    // Recreate all tables based on entities
    await dataSource.synchronize();
    console.log('Database schema recreated successfully');

    return true;
  } catch (error) {
    console.error('Error dropping and recreating database:', error);
    throw error;
  }
};

// Alternative: Just clear all data without dropping schema
export const clearAllData = async () => {
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // Get all entity metadata
    const entities = dataSource.entityMetadatas;

    // Disable foreign key checks temporarily (PostgreSQL)
    await dataSource.query('SET session_replication_role = replica;');

    // Truncate all tables
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
      console.log(`Cleared table: ${entity.tableName}`);
    }

    // Re-enable foreign key checks
    await dataSource.query('SET session_replication_role = DEFAULT;');

    console.log('All data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
