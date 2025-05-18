import Uavs from '../models/uavs';

export const seedUavs = async () => {
  const count = await Uavs.count();
  if (count > 0) {
    console.log('Uavs table already seeded');
    return;
  }

  const uavs = [
    { object: 'БС', uav_type: 'Квадрокоптер', circumstances: 'Несанкционированный пролёт' },
    { object: 'Офис МТС', uav_type: 'Фиксированное крыло', circumstances: 'Разведка' },
    { object: 'Категорированное помещение', uav_type: 'Мини-дрон', circumstances: 'Атака' },
  ];

  await Uavs.bulkCreate(uavs, { ignoreDuplicates: true });
  console.log('Uavs seeded successfully');
};