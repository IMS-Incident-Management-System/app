import DepartmentModel, { DepartmentModelType } from '../models/department';

// Используем Partial от DepartmentModelType для правильной типизации
type DepartmentSeed = Partial<Omit<DepartmentModelType, 'department_id'>>;

export const departmentSeeder = async () => {
  try {
    // Проверяем, есть ли уже данные
    const count = await DepartmentModel.count();
    if (count > 0) {
      console.log('Departments table already seeded');
      return;
    }

    // Создаем основные типы департаментов
    const mainDepartments: DepartmentSeed[] = [
      { name: 'КЦ', type: 'KTS' },
      { name: 'ФО', type: 'FO' },
      { name: 'ДЗК', type: 'DZK' },
      { name: 'ЕЦКБ', type: 'ETSKB' }
    ];

    const createdMain = await DepartmentModel.bulkCreate(mainDepartments);

    // Находим ID основных департаментов
    const ktsId = createdMain.find(d => d.type === 'KTS')?.department_id;
    const foId = createdMain.find(d => d.type === 'FO')?.department_id;
    const dzkId = createdMain.find(d => d.type === 'DZK')?.department_id;
    const etskbId = createdMain.find(d => d.type === 'ETSKB')?.department_id;

    // Подразделения КЦ
    if (ktsId) {
      await DepartmentModel.bulkCreate([
        { name: 'ДЭБ', type: 'KTS', parent_id: ktsId },
        { name: 'ДИБ', type: 'KTS', parent_id: ktsId },
        { name: 'ДАФ', type: 'KTS', parent_id: ktsId },
        { name: 'ДБПиО', type: 'KTS', parent_id: ktsId }
      ]);
    }

    // Федеральные округа
    if (foId) {
      const regions = [
        { name: 'Москва', region_type: 'moscow' },
        { name: 'Центр', region_type: 'center' },
        { name: 'Северо-Запад', region_type: 'northwest' },
        { name: 'Поволжье', region_type: 'volga' },
        { name: 'Юг', region_type: 'south' },
        { name: 'Урал', region_type: 'ural' },
        { name: 'Сибирь', region_type: 'siberia' },
        { name: 'Дальний Восток', region_type: 'fareast' }
      ];

      const createdRegions = await DepartmentModel.bulkCreate(
        regions.map(r => ({ ...r, type: 'FO', parent_id: foId }))
      );

      // Добавляем подразделения для каждого региона
      const regionSubdivisions = {
        center: [
          'Белгородская область', 'Брянская область', 'Владимирская область',
          'Воронежская область', 'Ивановская область', 'Калужская область',
          'Костромская область', 'Курская область', 'Липецкая область',
          'Орловская область', 'Рязанская область', 'Смоленская область',
          'Тамбовская область', 'Тверская область', 'Тульская область',
          'Ярославская область'
        ],
        northwest: [
          'Санкт-Петербург', 'Вологодская область', 'Калининградская область',
          'Мурманская область', 'Новгородская область', 'Псковская область',
          'Республика Карелия', 'Республика Коми', 'Архангельская область'
        ],
        // ... другие регионы
      };

      for (const region of createdRegions) {
        const subdivisions = regionSubdivisions[region.region_type as keyof typeof regionSubdivisions];
        if (subdivisions) {
          await DepartmentModel.bulkCreate(
            subdivisions.map(name => ({
              name,
              type: 'FO',
              parent_id: region.department_id,
              region_type: region.region_type
            }))
          );
        }
      }
    }

    // ДЗК
    if (dzkId) {
      await DepartmentModel.bulkCreate([
        { name: 'МГТС', type: 'DZK', parent_id: dzkId },
        { name: 'РТК', type: 'DZK', parent_id: dzkId },
        { name: 'МТС-Банк', type: 'DZK', parent_id: dzkId },
        { name: 'Стрим', type: 'DZK', parent_id: dzkId },
        { name: 'Беларусь', type: 'DZK', parent_id: dzkId },
        { name: 'Авантаж', type: 'DZK', parent_id: dzkId },
        // ... остальные ДЗК
      ]);
    }

    // ЕЦКБ
    if (etskbId) {
      await DepartmentModel.bulkCreate([
        { name: 'ОДС', type: 'ETSKB', parent_id: etskbId },
        { name: 'Начальники ЕЦКБ', type: 'ETSKB', parent_id: etskbId }
      ]);
    }

    console.log('Departments seeded successfully');
  } catch (error) {
    console.error('Error seeding departments:', error);
    throw error;
  }
}; 