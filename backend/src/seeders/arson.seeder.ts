import Arson from '../models/arson';

export const seedArson = async () => {
  const count = await Arson.count();
  if (count > 0) {
    console.log('Arson table already seeded');
    return;
  }

  const arson = [
    { object: 'БС', cause: 'Умышленный поджог', damage_amount: 80000 },
    { object: 'Офис МТС', cause: 'Неосторожность', damage_amount: 60000 },
  ];

  await Arson.bulkCreate(arson, { ignoreDuplicates: true });
  console.log('Arson seeded successfully');
};