import { departmentSeeder } from "./department.seeder";
import { seedEventTypes } from "./eventTypes.seeder";
import { seedObjects } from "./objects.seeder";

export const runSeeders = async () => {
  try {
    await departmentSeeder();
    await seedEventTypes();
    await seedObjects();
    console.log("All seeders completed successfully");
  } catch (error) {
    console.error("Error running seeders:", error);
    throw error;
  }
};
