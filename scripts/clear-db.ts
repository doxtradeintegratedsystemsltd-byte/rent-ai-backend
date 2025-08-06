import {
  dropAndRecreateDatabase,
  clearAllData,
} from '../src/utils/clearDatabase';

const main = async () => {
  const args = process.argv.slice(2);
  const option = args[0] || 'clear'; // 'clear' or 'drop'

  try {
    if (option === 'drop') {
      console.log('Dropping and recreating entire database schema...');
      await dropAndRecreateDatabase();
      console.log('✅ Database dropped and recreated successfully!');
    } else {
      console.log('Clearing all data from tables...');
      await clearAllData();
      console.log('✅ All data cleared successfully!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

main();
