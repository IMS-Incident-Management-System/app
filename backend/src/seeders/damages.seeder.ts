import Damages from '../models/damages';

export const seedDamages = async () => {
  const count = await Damages.count();
  if (count > 0) {
    console.log('Damages table already seeded');
    return;
  }

  const damages = [
    { object: 'БС', damage_type: 'Механическое', damage_amount: 30000 },
    { object: 'Офис МТС', damage_type: 'Химическое', damage_amount: 45000 },
    { object: 'Персонал', damage_type: 'Физическое', damage_amount: 20000 },
  ];

  await Damages.bulkCreate(damages, { ignoreDuplicates: true });
  console.log('Damages seeded successfully');
};