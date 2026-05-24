import DepartmentModel, { DepartmentModelType } from '../models/department';
import { transliterate } from '../utils/strings';

type DepartmentSeed = Partial<Omit<DepartmentModelType, 'department_id'>>;

const createDepartment = async (
  title: string, 
  parent_id?: number
): Promise<DepartmentSeed> => {
  if (!parent_id) {
    return {
      title,
      value: transliterate(title),
      parent_id: null
    };
  }

  // Получаем родительское подразделение для формирования уникального value
  const parent = await DepartmentModel.findByPk(parent_id);
  const parentPrefix = parent ? transliterate(parent.title) : '';
  
  return {
    title,
    value: `${parentPrefix}_${transliterate(title)}`.toLowerCase(),
    parent_id
  };
};

export const departmentSeeder = async () => {
  try {
    // Проверяем, есть ли уже данные
    const count = await DepartmentModel.count();
    if (count > 0) {
      console.log('Departments table already seeded');
      return;
    }

    // Создаем корневые подразделения
    const mainDepartments: DepartmentSeed[] = await Promise.all([
      createDepartment('КЦ'),
      createDepartment('ФО'),
      createDepartment('ДЗК'),
      createDepartment('ЕЦКБ')
    ]);

    const createdMain = await DepartmentModel.bulkCreate(mainDepartments);

    // Находим ID основных подразделений
    const ktsId = createdMain[0].department_id;
    const foId = createdMain[1].department_id;
    const dzkId = createdMain[2].department_id;
    const etskbId = createdMain[3].department_id;

    // Подразделения КЦ
    await DepartmentModel.bulkCreate(await Promise.all([
      createDepartment('ДЭБ', ktsId),
      createDepartment('ДИБ', ktsId),
      createDepartment('ДАФ', ktsId),
      createDepartment('ДБПиО', ktsId)
    ]));

    // Федеральные округа и их подразделения
    const regions = [
      {
        title: 'Москва',
        subdivisions: []
      },
      {
        title: 'Центр',
        subdivisions: [
          'Белгородская область', 'Брянская область', 'Владимирская область',
          'Воронежская область', 'Ивановская область', 'Калужская область',
          'Костромская область', 'Курская область', 'Липецкая область',
          'Орловская область', 'Рязанская область', 'Смоленская область',
          'Тамбовская область', 'Тверская область', 'Тульская область',
          'Ярославская область'
        ]
      },
      {
        title: 'СЗ',
        subdivisions: [
          'Санкт-Петербург', 'Вологодская область', 'Калининградская область',
          'Мурманская область', 'Новгородская область', 'Псковская область',
          'Республика Карелия', 'Республика Коми', 'Архангельская область'
        ]
      },
      {
        title: 'Поволжье',
        subdivisions: [
          'Кировская область', 'Оренбургская область', 'Самарская область',
          'Саратовская область', 'Нижегородская область', 'Пензенская область',
          'Пермский край', 'Республика Башкортостан', 'Республика Марий Эл',
          'Республика Мордовия', 'Республика Татарстан', 'Удмуртская Республика',
          'Ульяновская область', 'Чувашская Республика'
        ]
      },
      {
        title: 'Юг',
        subdivisions: [
          'Краснодар', 'Сочи', 'Новороссийск', 'Ростов', 'Ставрополь',
          'Волгоград', 'Астрахань', 'Алания', 'Ингушетия', 'КБР',
          'КЧР', 'Дагестан', 'Чечня'
        ]
      },
      {
        title: 'Урал',
        subdivisions: [
          'Свердловская область', 'ХМАО-Югра', 'Челябинская область',
          'Тюменская область', 'Курган', 'ЯНАО'
        ]
      },
      {
        title: 'Сибирь',
        subdivisions: [
          'Новосибирская область', 'Омская область', 'Томская область',
          'Алтайский край', 'Республика Алтай', 'Красноярский край',
          'Кемеровская область', 'Республика Хакасия', 'Республика Тыва',
          'Иркутская область'
        ]
      },
      {
        title: 'ДВ',
        subdivisions: [
          'Хабаровский край', 'Приморский край', 'Амурская область',
          'Магаданская область', 'Республика Саха (Якутия)', 'Камчатский край',
          'Сахалинская область', 'Забайкальский край', 'Республика Бурятия'
        ]
      }
    ];

    // Создаем регионы и их подразделения
    for (const region of regions) {
      const createdRegion = await DepartmentModel.create(await createDepartment(region.title, foId));
      
      if (region.subdivisions.length > 0) {
        const subdivisionSeeds = await Promise.all(
          region.subdivisions.map(title => createDepartment(title, createdRegion.department_id))
        );
        await DepartmentModel.bulkCreate(subdivisionSeeds);
      }
    }

    // Дочерние компании
    const dzkCompanies = [
      'МГТС', 'РТК', 'МТС-Банк', 'Стрим', 'Беларусь', 'Авантаж',
      'Гринбуш', 'СТВ', 'МТТ', 'ИТ-ГРАД', 'Диджитал', 'КИОН',
      'ОРК', 'Лайв', 'КП', 'КС', 'ПТ'
    ];

    await DepartmentModel.bulkCreate(
      await Promise.all(dzkCompanies.map(title => createDepartment(title, dzkId)))
    );

    // ЕЦКБ
    await DepartmentModel.bulkCreate(await Promise.all([
      createDepartment('ОДС', etskbId),
      createDepartment('Начальники ЕЦКБ', etskbId)
    ]));

    console.log('Departments seeded successfully');
  } catch (error) {
    console.error('Error seeding departments:', error);
    throw error;
  }
};