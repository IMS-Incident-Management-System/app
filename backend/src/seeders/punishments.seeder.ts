import Punishments from '../models/punishments';

export const seedPunishments = async () => {
  const count = await Punishments.count();
  if (count > 0) {
    console.log('Punishments table already seeded');
    return;
  }

  const punishments = [
    { full_name: 'Иванов Иван Иванович', position: 'Менеджер', punishment_type: 'Выговор' },
    { full_name: 'Петров Пётр Петрович', position: 'Техник', punishment_type: 'Штраф' },
    { full_name: 'Сидорова Анна Сергеевна', position: 'Бухгалтер', punishment_type: 'Увольнение' },
  ];

  await Punishments.bulkCreate(punishments, { ignoreDuplicates: true });
  console.log('Punishments seeded successfully');
};