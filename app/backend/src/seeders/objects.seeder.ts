import Object, { ObjectAttributes } from '../models/object';
import { ObjectType } from '../enums/object';
import { Optional } from 'sequelize';

type ObjectCreationAttributes = Optional<ObjectAttributes, 'id'>;

export const seedObjects = async () => {
  const count = await Object.count();
  if (count > 0) {
    console.log('Objects table already seeded');
    return;
  }

  const objects: ObjectCreationAttributes[] = [
    {
      type: ObjectType.BS,
      number: 'БС-123',
      address: 'ул. Ленина, 10'
    },
    {
      type: ObjectType.OFFICE_MTS,
      number: 'ОФ-456',
      address: 'ул. Советская, 20'
    },
    {
      type: ObjectType.CATEGORIZED_ROOM,
      address: 'ул. Мира, 30'
    },
    {
      type: ObjectType.OTHER_PROPERTY
    },
    {
      type: ObjectType.PERSONNEL,
      personnel_full_name: 'Иванов Иван Иванович',
      personnel_position: 'Менеджер',
      personnel_employee_number: 'EMP-789'
    },
    // Дополнительные тестовые объекты
    {
      type: ObjectType.BS,
      number: 'БС-456',
      address: 'ул. Пушкина, 15'
    },
    {
      type: ObjectType.OFFICE_MTS,
      number: 'ОФ-789',
      address: 'пр. Гагарина, 25'
    }
  ];

  try {
    await Object.bulkCreate(objects, { 
      validate: true,
      ignoreDuplicates: true 
    });
    console.log('Objects seeded successfully');
  } catch (error) {
    console.error('Error seeding objects:', error);
    throw error;
  }
};