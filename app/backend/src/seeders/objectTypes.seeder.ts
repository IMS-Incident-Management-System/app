import ObjectType from '../models/objectType';

export const seedObjectTypes = async () => {
  const count = await ObjectType.count();
  if (count > 0) {
    console.log('Object types table already seeded');
    return;
  }

  const objectTypes = [
    { title: 'Базовая станция', parent_id: null },
    { title: 'Офис МТС', parent_id: null },
    { title: 'Категорированное помещение', parent_id: null },
    { title: 'Иное имущество', parent_id: null },
    { title: 'Персонал', parent_id: null },
  ];

  try {
    await ObjectType.bulkCreate(objectTypes, { 
      validate: true,
      ignoreDuplicates: true 
    });
    console.log('Object types seeded successfully');
  } catch (error) {
    console.error('Error seeding object types:', error);
    throw error;
  }
};
