import TheftType, { TheftTypeCreationAttributes } from "../../models/incidentEvents/theft";
import { TheftTypeEnum } from "../../enums/theft";

export const seedTheftTypes = async () => {
  const count = await TheftType.count();
  if (count > 0) {
    console.log('TheftTypes table already seeded');
    return;
  }

  const theftTypes: TheftTypeCreationAttributes[] = [
    {
      type: TheftTypeEnum.CABLE,
      name: 'Кража кабеля'
    },
    {
      type: TheftTypeEnum.BATTERY,
      name: 'Кража АКБ'
    },
    {
      type: TheftTypeEnum.EQUIPMENT,
      name: 'Кража оборудования'
    }
  ];

  try {
    await TheftType.bulkCreate(theftTypes, {
      validate: true,
      ignoreDuplicates: true
    });
    console.log('TheftTypes seeded successfully');
  } catch (error) {
    console.error('Error seeding theft types:', error);
    throw error;
  }
};