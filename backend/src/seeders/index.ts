import { seedArson } from "./arson.seeder";
import { seedDamages } from "./damages.seeder";
import { departmentSeeder } from "./department.seeder";
import { seedEventTypes } from "./eventTypes.seeder";
import { seedFires } from "./fires.seeder";
import { seedObjects } from "./objects.seeder";
import { seedPunishments } from "./punishments.seeder";
import { seedThefts } from "./thefts.seeder";
import { seedUavs } from "./uavs.seeder";

export const runSeeders = async () => {
  try {
    await departmentSeeder();
    await seedEventTypes();
    await seedObjects();
    await seedThefts();
    await seedFires();
    await seedDamages();
    await seedUavs();
    await seedArson();
    await seedPunishments();
    console.log("All seeders completed successfully");
  } catch (error) {
    console.error("Error running seeders:", error);
    throw error;
  }
};
