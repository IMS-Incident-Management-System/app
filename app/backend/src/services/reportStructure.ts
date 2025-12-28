// Полная структура всех возможных групп и подгрупп для правильной нумерации

export interface GroupStructure {
  group: string;
  groupName: string;
  subgroups: SubgroupStructure[];
}

export interface SubgroupStructure {
  subgroup: string;
  subgroupName: string;
  subsubgroups?: string[];
}

export const REPORT_STRUCTURE: GroupStructure[] = [
  {
    group: '1',
    groupName: 'Проведение мероприятий, проверок и расследований',
    subgroups: [
      {
        subgroup: '1.1',
        subgroupName: 'Проведено служебных проверок и расследований',
        subsubgroups: ['1.1.1', '1.1.2', '1.1.3']
      },
      {
        subgroup: '1.2',
        subgroupName: 'Общее количество СП, СП ИБ и СР с'
      },
      {
        subgroup: '1.3',
        subgroupName: 'Проведено проверочных мероприятий (ПМ) в рамках'
      },
      {
        subgroup: '1.4',
        subgroupName: 'Выявлен ущерб (руб.)'
      },
      {
        subgroup: '1.5',
        subgroupName: 'Возмещен ущерб (руб.)'
      },
      {
        subgroup: '1.6',
        subgroupName: 'Предотвращен ущерб (руб.)'
      },
      {
        subgroup: '1.7',
        subgroupName: 'Получен дополнительный доход (руб.)'
      },
      {
        subgroup: '1.8',
        subgroupName: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)'
      },
      {
        subgroup: '1.9',
        subgroupName: 'Принято мер к виновным лицам (сумма пп. 1.9.1 -',
        subsubgroups: ['1.9.1', '1.9.2', '1.9.3', '1.9.4']
      },
      {
        subgroup: '1.10',
        subgroupName: 'Передано материалов в ПОО для возбуждения',
        subsubgroups: ['1.10.1']
      },
      {
        subgroup: '1.11',
        subgroupName: 'Возбуждено административных/уголовных дел',
        subsubgroups: ['1.11.1']
      }
    ]
  },
  {
    group: '2',
    groupName: 'Работа по возмещению ДЗ и НДС',
    subgroups: [
      {
        subgroup: '2.1',
        subgroupName: 'Общий размер дебиторской задолженности (руб.)'
      },
      {
        subgroup: '2.2',
        subgroupName: 'Общий размер просроченной дебиторской задолженности',
        subsubgroups: ['2.2.1']
      },
      {
        subgroup: '2.3',
        subgroupName: 'Взыскано ДЗ при участии подразделений'
      },
      {
        subgroup: '2.4',
        subgroupName: 'Общая сумма доступного к возмещению, но не возмещенного НДС'
      },
      {
        subgroup: '2.5',
        subgroupName: 'Содействие в получении документов для возмещения НДС'
      },
      {
        subgroup: '2.6',
        subgroupName: 'Общий размер списанной дебиторской задолженности'
      },
      {
        subgroup: '2.7',
        subgroupName: 'Предотвращено фактов необоснованного списания'
      }
    ]
  },
  {
    group: '3',
    groupName: 'Контроль инвестиционной, закупочной и договорной деятельности',
    subgroups: [
      {
        subgroup: '3.1',
        subgroupName: 'Проверено юр. и физ.лиц перед заключением новых договоров',
        subsubgroups: ['3.1.1']
      },
      {
        subgroup: '3.2',
        subgroupName: 'Проверено контрагентов с действующими договорами',
        subsubgroups: ['3.2.1']
      },
      {
        subgroup: '3.3',
        subgroupName: 'Проверено проектов договоров, доп. соглашений',
        subsubgroups: ['3.3.1']
      },
      {
        subgroup: '3.4',
        subgroupName: 'Проверено действующих договоров, доп. соглашений'
      }
    ]
  }
];





