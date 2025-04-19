import { departmentSeeder } from './department.seeder';

export const runSeeders = async () => {
  try {
    await departmentSeeder();
    console.log('All seeders completed successfully');
  } catch (error) {
    console.error('Error running seeders:', error);
    throw error;
  }
}; 