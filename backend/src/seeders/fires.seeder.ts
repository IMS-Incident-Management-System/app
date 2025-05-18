import Fires from '../models/fires';

export const seedFires = async () => {
  const count = await Fires.count();
  if (count > 0) {
    console.log('Fires table already seeded');
    return;
  }

  const fires = [
    { object: 'БС', cause: 'Короткое замыкание', damage_amount: 100000 },
    { object: 'Офис МТС', cause: 'Неосторожное обращение с огнём', damage_amount: 50000 },
    { object: 'Категорированное помещение', cause: 'Неисправная проводка', damage_amount: 75000 },
  ];

  await Fires.bulkCreate(fires, { ignoreDuplicates: true });
  console.log('Fires seeded successfully');
};