import Objects from '../models/objects';

export const seedObjects = async () => {
  const count = await Objects.count();
  if (count > 0) {
    console.log('Objects table already seeded');
    return;
  }

  const objects = [
    { type: 'БС', bs_number: 'БС-123', address: 'ул. Ленина, 10' },
    { type: 'Офис МТС', office_number: 'ОФ-456', address: 'ул. Советская, 20' },
    { type: 'Категорированное помещение', address: 'ул. Мира, 30' },
    { type: 'Иное имущество' },
    { type: 'Персонал', full_name: 'Иванов Иван Иванович', position: 'Менеджер', employee_id: 'EMP-789' },
  ];

  await Objects.bulkCreate(objects, { ignoreDuplicates: true });
  console.log('Objects seeded successfully');
};