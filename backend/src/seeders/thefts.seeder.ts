import Thefts from '../models/thefts';

export const seedThefts = async () => {
  const count = await Thefts.count();
  if (count > 0) {
    console.log('Thefts table already seeded');
    return;
  }

  const thefts = [
    { object: 'БС', damage_amount: 50000, criminal_case: 'УД-123' },
    { object: 'Персонал', damage_amount: 10000, criminal_case: 'Нет' },
    { object: 'Иное имущество', damage_amount: 25000, criminal_case: 'УД-456' },
  ];

  await Thefts.bulkCreate(thefts, { ignoreDuplicates: true });
  console.log('Thefts seeded successfully');
};