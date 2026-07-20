/**
 * Определения полей отчёта РП-053 (160 правил).
 * Каждое поле: key (legacy rN), metricKey (семантический id), label, rule.
 */

export type ReportRule =
  | { type: 'EVENT_SUM_BOOLEANS'; flags: string[] }
  | { type: 'EVENT_COUNT_BOOLEAN'; flag: string }
  | { type: 'EVENT_EVENTS_WITH_VIOLATIONS'; flags: string[] }
  | { type: 'SUM_EVENTS_INCIDENTS_ADDITIONALLY'; field: string }
  | { type: 'EVENT_SUM_FIELD'; field: string }
  | { type: 'EVENT_SUM_VAT'; field: string }
  | { type: 'EVENT_ADDITIONALLY_SUM'; source: string }
  | { type: 'EVENT_ADDITIONALLY_CRIMINAL'; condition: 'transferred' | 'rejected' | 'opened' | 'closed' }
  | { type: 'OA_FIELD'; direction: string; category: string; field: string }
  | { type: 'OA_SUM_FIELDS'; direction: string; category: string; fields: string[] }
  | { type: 'INCIDENT_COUNT_BY_TYPE'; eventTypeTitle: string; subTypeTitle?: string }
  | { type: 'INCIDENT_SUM_BY_TYPE'; eventTypeTitle: string; subTypeTitle?: string }
  | { type: 'ADDITIONALLY_BY_INCIDENT_TYPE'; eventTypeTitle: string; container: 'punishment' | 'financial'; field: string }
  | { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE'; eventTypeTitle: string; condition: 'transferred' | 'opened' | 'closed' }
  | { type: 'ADDITIONALLY_PUNISHMENT_SUM_BY_INCIDENT_TYPE'; eventTypeTitle: string; fields: string[] }
  | { type: 'EVENT_COUNT_BOOLEANS_SUM'; flags: string[] }
  | { type: 'EVENT_IB_CHECKS_SUM'; flags: string[] }
  | { type: 'EVENT_COUNT_ALL_BOOLEANS'; flags: string[] }
  | { type: 'INCIDENT_EVENT_TRAUMA'; outcome: 'injury' | 'death'; employeeOnly?: boolean }
  | { type: 'INCIDENT_COUNT_EVENT_TYPE'; eventTypeTitle: string }
  | { type: 'OA_FIELD_OPT'; direction: string; category: string; field: string; id?: string };

export interface ReportFieldDef {
  /** Legacy alias (r1..r160) for API compatibility */
  key: string;
  /** Stable semantic identifier for facts / imports */
  metricKey: string;
  label: string;
  rule: ReportRule;
}

export const REPORT_FIELDS: ReportFieldDef[] = [
  // 1
  {
    key: 'r1',
    metricKey: 'event_sum_booleans_rp053',
    label: 'Проведено служебных проверок и расследований по РП-053',
    rule: {
      type: 'EVENT_SUM_BOOLEANS',
      flags: [
        'is_service_investigation',
        'is_service_check',
        'is_service_check_ib',
        'is_service_investigation_ib',
        'is_service_investigation_bpio',
        'is_service_check_bpio',
      ],
    },
  },
  // 2
  { key: 'r2',
    metricKey: 'event_count_is_service_investigation', label: 'Проведено служебных расследований (СР)', rule: { type: 'EVENT_COUNT_BOOLEAN', flag: 'is_service_investigation' } },
  // 3
  { key: 'r3',
    metricKey: 'event_count_is_service_check', label: 'Проведено служебных проверок (СП)', rule: { type: 'EVENT_COUNT_BOOLEAN', flag: 'is_service_check' } },
  // 4
  { key: 'r4',
    metricKey: 'event_count_is_service_check_ib', label: 'Проведено служебных проверок по ИБ (СП ИБ)', rule: { type: 'EVENT_COUNT_BOOLEAN', flag: 'is_service_check_ib' } },
  // 5
  {
    key: 'r5',
    metricKey: 'event_with_violations',
    label: 'Общее количество СП, СП ИБ и СР с выявленными нарушениями',
    rule: {
      type: 'EVENT_EVENTS_WITH_VIOLATIONS',
      flags: [
        'is_service_investigation',
        'is_service_check',
        'is_service_check_ib',
        'is_service_investigation_ib',
        'is_service_investigation_bpio',
        'is_service_check_bpio',
      ],
    },
  },
  // 6
  { key: 'r6',
    metricKey: 'event_count_is_verification_activity', label: 'Проведено проверочных мероприятий (ПМ) в рамках операционной деятельности', rule: { type: 'EVENT_COUNT_BOOLEAN', flag: 'is_verification_activity' } },
  // 7
  { key: 'r7',
    metricKey: 'sum_eia_detected_damage', label: 'Выявлен ущерб (руб.)', rule: { type: 'SUM_EVENTS_INCIDENTS_ADDITIONALLY', field: 'detected_damage' } },
  // 8
  { key: 'r8',
    metricKey: 'sum_eia_recovered_damage', label: 'Возмещен ущерб (руб.)', rule: { type: 'SUM_EVENTS_INCIDENTS_ADDITIONALLY', field: 'recovered_damage' } },
  // 9
  { key: 'r9',
    metricKey: 'sum_eia_prevented_damage', label: 'Предотвращен ущерб (руб.)', rule: { type: 'SUM_EVENTS_INCIDENTS_ADDITIONALLY', field: 'prevented_damage' } },
  // 10
  { key: 'r10',
    metricKey: 'sum_eia_additional_income', label: 'Получен дополнительный доход (руб.)', rule: { type: 'SUM_EVENTS_INCIDENTS_ADDITIONALLY', field: 'additional_income' } },
  // 11
  { key: 'r11',
    metricKey: 'sum_eia_reduced_cost', label: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)', rule: { type: 'SUM_EVENTS_INCIDENTS_ADDITIONALLY', field: 'reduced_cost' } },
  // 12
  { key: 'r12',
    metricKey: 'event_sum_prevented_unnecessary_writeoff', label: 'Предотвращено фактов необоснованного списания ДЗ на сумму (руб.)', rule: { type: 'EVENT_SUM_FIELD', field: 'prevented_unnecessary_writeoff' } },
  // 13
  { key: 'r13',
    metricKey: 'event_vat_vat_deducted', label: 'Содействие в получении документов для возмещения НДС (руб.)', rule: { type: 'EVENT_SUM_VAT', field: 'vat_deducted' } },
  // 14
  { key: 'r14',
    metricKey: 'event_add_guilty_persons_count', label: 'Установлено виновных лиц', rule: { type: 'EVENT_ADDITIONALLY_SUM', source: 'guilty_persons_count' } },
  // 15
  { key: 'r15',
    metricKey: 'event_add_measures_taken_count', label: 'Принято мер к виновным лицам', rule: { type: 'EVENT_ADDITIONALLY_SUM', source: 'measures_taken_count' } },
  // 16
  { key: 'r16',
    metricKey: 'event_add_warning_letter_rp398', label: 'Предупреждение предупредительным письмом по РП-398', rule: { type: 'EVENT_ADDITIONALLY_SUM', source: 'warning_letter_rp398' } },
  // 17
  { key: 'r17',
    metricKey: 'event_add_remark', label: 'Замечание', rule: { type: 'EVENT_ADDITIONALLY_SUM', source: 'remark' } },
  // 18
  { key: 'r18',
    metricKey: 'event_add_reprimand', label: 'Выговор', rule: { type: 'EVENT_ADDITIONALLY_SUM', source: 'reprimand' } },
  // 19
  { key: 'r19',
    metricKey: 'event_add_dismissed_count', label: 'Уволено', rule: { type: 'EVENT_ADDITIONALLY_SUM', source: 'dismissed_count' } },
  // 20
  { key: 'r20',
    metricKey: 'event_criminal_transferred', label: 'Передано материалов в ПОО для возбуждения АД/УД', rule: { type: 'EVENT_ADDITIONALLY_CRIMINAL', condition: 'transferred' } },
  // 21
  { key: 'r21',
    metricKey: 'event_criminal_rejected', label: 'из них отказано в возбуждении административных/уголовных дел', rule: { type: 'EVENT_ADDITIONALLY_CRIMINAL', condition: 'rejected' } },
  // 22
  { key: 'r22',
    metricKey: 'event_criminal_opened', label: 'Возбуждено административных/уголовных дел', rule: { type: 'EVENT_ADDITIONALLY_CRIMINAL', condition: 'opened' } },
  // 23
  { key: 'r23',
    metricKey: 'event_criminal_closed', label: 'из них окончено АД/УД (приговор/решение суда)', rule: { type: 'EVENT_ADDITIONALLY_CRIMINAL', condition: 'closed' } },
  // 24–43: OA ЭБ
  { key: 'r24',
    metricKey: 'oa_economic_total_debt', label: 'Общий размер дебиторской задолженности (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'DEBT_RECOVERY', field: 'total_debt' } },
  { key: 'r25',
    metricKey: 'oa_economic_overdue_debt', label: 'Общий размер просроченной дебиторской задолженности (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'DEBT_RECOVERY', field: 'overdue_debt' } },
  { key: 'r26',
    metricKey: 'oa_economic_overdue_debt_sb', label: 'в том числе размер ПДЗ, переданный в работу СБ (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'DEBT_RECOVERY', field: 'overdue_debt_sb' } },
  { key: 'r27',
    metricKey: 'oa_economic_recovered_debt', label: 'Взыскано ДЗ при участии подразделений безопасности (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'DEBT_RECOVERY', field: 'recovered_debt' } },
  { key: 'r28',
    metricKey: 'oa_economic_available_vat', label: 'Общая сумма доступного к возмещению, но не возмещенного НДС (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'DEBT_RECOVERY', field: 'available_vat' } },
  { key: 'r29',
    metricKey: 'oa_economic_written_off_debt', label: 'Общий размер списанной дебиторской задолженности (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'DEBT_RECOVERY', field: 'written_off_debt' } },
  { key: 'r30',
    metricKey: 'oa_economic_checked_entities_new', label: 'Проверено юр. и физ.лиц перед заключением новых договоров, доп.соглашений и ОВП', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'checked_entities_new' } },
  { key: 'r31',
    metricKey: 'oa_economic_negative_conclusions_new', label: 'из них дано отрицательных заключений по потенциальным контрагентам', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'negative_conclusions_new' } },
  { key: 'r32',
    metricKey: 'oa_economic_checked_entities_active', label: 'Проверено контрагентов с действующими договорами', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'checked_entities_active' } },
  { key: 'r33',
    metricKey: 'oa_economic_negative_conclusions_active', label: 'из них дано отрицательных заключений по контрагентам', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'negative_conclusions_active' } },
  { key: 'r34',
    metricKey: 'oa_economic_checked_draft_contracts', label: 'Проверено проектов договоров. доп. соглашений, заказов и ОВП', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'checked_draft_contracts' } },
  { key: 'r35',
    metricKey: 'oa_economic_not_approved_drafts', label: 'из них не согласовано', rule: { type: 'OA_FIELD_OPT', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'not_approved_drafts', id: 'not_approved_drafts' } },
  { key: 'r36',
    metricKey: 'oa_economic_checked_active_contracts', label: 'Проверено действующих договоров, доп. соглашений и заказов', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'checked_active_contracts' } },
  { key: 'r37',
    metricKey: 'oa_economic_not_approved_active', label: 'из них не согласовано', rule: { type: 'OA_FIELD_OPT', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'not_approved_active', id: 'not_approved_active' } },
  { key: 'r38',
    metricKey: 'oa_economic_planned_budget', label: 'Сумма запланированного бюджета закупок на год (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'planned_budget' } },
  { key: 'r39',
    metricKey: 'oa_economic_procurement_procedures_count', label: 'Проведено закупочных процедур (кол-во)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'procurement_procedures_count' } },
  { key: 'r40',
    metricKey: 'oa_economic_single_source_count', label: 'из них использован способ закупки "единственный источник" (кол-во)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'single_source_count' } },
  { key: 'r41',
    metricKey: 'oa_economic_procurement_procedures_sum', label: 'Проведено закупочных процедур на сумму (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'procurement_procedures_sum' } },
  { key: 'r42',
    metricKey: 'oa_economic_single_source_sum', label: 'из них использован способ закупки "единственный источник" на сумму (руб.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'INVESTMENT_CONTROL', field: 'single_source_sum' } },
  { key: 'r43',
    metricKey: 'oa_economic_checked_employees', label: 'Проверено сотрудников на их возможную аффилированность с контрагентами (чел.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'AFFILIATION', field: 'checked_employees' } },
  { key: 'r44',
    metricKey: 'oa_economic_found_affiliated', label: 'из них выявлено аффилированных лиц', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'AFFILIATION', field: 'found_affiliated' } },
  { key: 'r45',
    metricKey: 'oa_economic_checked_candidates', label: 'Проверено кандидатов на трудоустройство (чел.)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'AFFILIATION', field: 'checked_candidates' } },
  { key: 'r46',
    metricKey: 'oa_economic_rejected_candidates', label: 'из них отклонено', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'AFFILIATION', field: 'rejected_candidates' } },
  { key: 'r47',
    metricKey: 'oa_economic_rejected_affiliated', label: 'из них отклонено по причине аффилированности', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'AFFILIATION', field: 'rejected_affiliated' } },
  { key: 'r48',
    metricKey: 'oa_economic_total_appeals', label: 'Проверено обращений граждан и юр. Лиц', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'CITIZEN_APPEALS', field: 'total_appeals' } },
  { key: 'r49',
    metricKey: 'oa_economic_zon_applications', label: 'Проверено заявлений абонентов о непричастности к договору (ЗОН)', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'CITIZEN_APPEALS', field: 'zon_applications' } },
  { key: 'r50',
    metricKey: 'oa_economic_fictitious_contracts', label: 'из них выявлено фиктивных договоров', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'CITIZEN_APPEALS', field: 'fictitious_contracts' } },
  { key: 'r51',
    metricKey: 'oa_economic_termination_requests', label: 'Проверено заявлений абонентов о расторжении договора и возврате ДС', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'CITIZEN_APPEALS', field: 'termination_requests' } },
  { key: 'r52',
    metricKey: 'oa_economic_beautiful_numbers', label: 'Проверено запросов на переоформление "красивых" номеров', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'CITIZEN_APPEALS', field: 'beautiful_numbers' } },
  { key: 'r53',
    metricKey: 'oa_economic_sim_replacement', label: 'Проверено заявлений о неправомерной замене SIM-карт с последующим выводом ДС', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'CITIZEN_APPEALS', field: 'sim_replacement' } },
  { key: 'r54',
    metricKey: 'oa_economic_refund_requests', label: 'Проверено заявлений абонентов о возврате ошибочного платежа', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'CITIZEN_APPEALS', field: 'refund_requests' } },
  { key: 'r55',
    metricKey: 'oa_economic_other_appeals', label: 'Проверено прочих заявлений абонентов', rule: { type: 'OA_FIELD', direction: 'ECONOMIC', category: 'CITIZEN_APPEALS', field: 'other_appeals' } },
  // КБ
  { key: 'r56',
    metricKey: 'oa_cyber_cyber_incoming_paper_requests', label: 'Поступило входящих бумажных запросов ПОО на предоставление информации', rule: { type: 'OA_FIELD', direction: 'CYBER', category: 'CYBER_LAW_ENFORCEMENT', field: 'cyber_incoming_paper_requests' } },
  { key: 'r57',
    metricKey: 'oa_cyber_cyber_executed_paper_requests', label: 'Исполнено бумажных запросов ПОО на предоставление информации', rule: { type: 'OA_FIELD', direction: 'CYBER', category: 'CYBER_LAW_ENFORCEMENT', field: 'cyber_executed_paper_requests' } },
  { key: 'r58',
    metricKey: 'oa_cyber_cyber_executed_paper_tasks', label: 'Исполнено заданий в бумажных запросах ПОО на предоставление информации', rule: { type: 'OA_FIELD', direction: 'CYBER', category: 'CYBER_LAW_ENFORCEMENT', field: 'cyber_executed_paper_tasks' } },
  { key: 'r59',
    metricKey: 'oa_cyber_cyber_received_presentations', label: 'Поступило представлений правоохранительных органов, прокуратуры и суда', rule: { type: 'OA_FIELD', direction: 'CYBER', category: 'CYBER_LAW_ENFORCEMENT', field: 'cyber_received_presentations' } },
  { key: 'r60',
    metricKey: 'oa_cyber_cyber_executed_presentations', label: 'из них исполнено (подготовлен ответ)', rule: { type: 'OA_FIELD', direction: 'CYBER', category: 'CYBER_LAW_ENFORCEMENT', field: 'cyber_executed_presentations' } },
  // БПиО
  { key: 'r61',
    metricKey: 'oa_security_staff_count', label: 'Штатное количество сотрудников безопасности (включая филиалы и ДЗО)', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'STAFF_COUNT', field: 'staff_count' } },
  { key: 'r62',
    metricKey: 'oa_security_objects_count', label: 'Количество объектов', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'OBJECTS_COUNT', field: 'objects_count' } },
  { key: 'r63',
    metricKey: 'oa_security_objects_physical_security', label: 'под физической охраной', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'OBJECTS_COUNT', field: 'objects_physical_security' } },
  { key: 'r64',
    metricKey: 'oa_security_objects_panel_security', label: 'под пультовой охраной', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'OBJECTS_COUNT', field: 'objects_panel_security' } },
  { key: 'r65',
    metricKey: 'oa_security_capex_allocated', label: 'CAPEX Сумма выделенного бюджета на год (руб.)', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'CAPEX_BUDGET', field: 'capex_allocated' } },
  { key: 'r66',
    metricKey: 'oa_security_capex_spent_current', label: 'Сумма освоения бюджета в текущем месяце (руб.)', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'CAPEX_BUDGET', field: 'capex_spent_current' } },
  { key: 'r67',
    metricKey: 'oa_security_opex_allocated', label: 'Бюджет на физ. охрану (OPEX)', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'OPEX_BUDGET', field: 'opex_allocated' } },
  { key: 'r68',
    metricKey: 'oa_sum_security_atz_inspections', label: 'Проведено проверок состояния АТЗ объектов', rule: { type: 'OA_SUM_FIELDS', direction: 'SECURITY', category: 'ATZ_INSPECTIONS', fields: ['atz_checks_pb', 'atz_checks_law'] } },
  { key: 'r69',
    metricKey: 'oa_security_atz_checks_pb', label: 'сотрудниками ПБ ДЗК/ДЗО', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'ATZ_INSPECTIONS', field: 'atz_checks_pb' } },
  { key: 'r70',
    metricKey: 'oa_security_atz_checks_law', label: 'совместно с сотрудниками правоохранительных органов', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'ATZ_INSPECTIONS', field: 'atz_checks_law' } },
  { key: 'r71',
    metricKey: 'oa_sum_security_atu_att', label: 'Проведено АТУ и АТТ на объектах', rule: { type: 'OA_SUM_FIELDS', direction: 'SECURITY', category: 'ATU_ATT', fields: ['atu_att_pb', 'atu_att_law'] } },
  { key: 'r72',
    metricKey: 'oa_security_atu_att_pb', label: 'сотрудниками ПБ ДЗК/ДЗО', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'ATU_ATT', field: 'atu_att_pb' } },
  { key: 'r73',
    metricKey: 'oa_security_atu_att_law', label: 'совместно с сотрудниками правоохранительных органов', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'ATU_ATT', field: 'atu_att_law' } },
  { key: 'r74',
    metricKey: 'oa_security_chop_checks', label: 'Проведено проверок несения службы сотрудниками ЧОП/ЧОО', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'SECURITY_COMPANY', field: 'chop_checks' } },
  { key: 'r75',
    metricKey: 'oa_security_chop_claims', label: 'Подготовлено претензий к ЧОП/ЧОО', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'SECURITY_COMPANY', field: 'chop_claims' } },
  // 76–88: Проникновение на объект (инциденты + дополнения)
  { key: 'r76',
    metricKey: 'inc_sum_proniknovenie_na_obekt', label: 'Проникновение на объект', rule: { type: 'INCIDENT_SUM_BY_TYPE', eventTypeTitle: 'Проникновение на объект' } },
  { key: 'r77',
    metricKey: 'inc_count_proniknovenie_na_obekt_ne_predotvraschennyy', label: 'не предотвращенные', rule: { type: 'INCIDENT_COUNT_BY_TYPE', eventTypeTitle: 'Проникновение на объект', subTypeTitle: 'Не предотвращенный' } },
  { key: 'r78',
    metricKey: 'inc_count_proniknovenie_na_obekt_predotvraschennye', label: 'предотвращенные', rule: { type: 'INCIDENT_COUNT_BY_TYPE', eventTypeTitle: 'Проникновение на объект', subTypeTitle: 'Предотвращенные' } },
  { key: 'r79',
    metricKey: 'add_proniknovenie_na_obekt_punishment_detained_persons_count', label: 'Задержаны лица при совершении правонарушения', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', container: 'punishment', field: 'detained_persons_count' } },
  { key: 'r80',
    metricKey: 'add_proniknovenie_na_obekt_financial_detected_damage', label: 'Установлена сумма причиненного ущерба (руб.)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', container: 'financial', field: 'detected_damage' } },
  { key: 'r81',
    metricKey: 'add_proniknovenie_na_obekt_financial_prevented_damage', label: 'Предотвращен ущерб на сумму (руб.)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', container: 'financial', field: 'prevented_damage' } },
  { key: 'r82',
    metricKey: 'add_proniknovenie_na_obekt_financial_recovered_damage', label: 'Возмещен ущерб на сумму (руб.)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', container: 'financial', field: 'recovered_damage' } },
  { key: 'r83',
    metricKey: 'add_proniknovenie_na_obekt_punishment_employees_involved_count', label: 'Установлено сотрудников, причастных к проникновению', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', container: 'punishment', field: 'employees_involved_count' } },
  { key: 'r84',
    metricKey: 'add_pun_sum_proniknovenie_na_obekt', label: 'наложено дисциплинарных взысканий и уволено с работы', rule: { type: 'ADDITIONALLY_PUNISHMENT_SUM_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', fields: ['warning_letter_rp398', 'remark', 'reprimand'] } },
  { key: 'r85',
    metricKey: 'add_proniknovenie_na_obekt_punishment_dismissed_count', label: 'уволено с работы', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', container: 'punishment', field: 'dismissed_count' } },
  { key: 'r86',
    metricKey: 'add_crim_proniknovenie_na_obekt_transferred', label: 'Передано материалов в правоохранительные органы', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', condition: 'transferred' } },
  { key: 'r87',
    metricKey: 'add_crim_proniknovenie_na_obekt_opened', label: 'Возбуждено уголовных дел', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', condition: 'opened' } },
  { key: 'r88',
    metricKey: 'add_crim_proniknovenie_na_obekt_closed', label: 'Окончено уголовных дел', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Проникновение на объект', condition: 'closed' } },
  // 89–101: Нападение на объект/сотрудников
  { key: 'r89',
    metricKey: 'inc_sum_napadenie_na_obekt_sotrudnikov', label: 'Нападение на объект/сотрудников (грабеж, разбой)', rule: { type: 'INCIDENT_SUM_BY_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников' } },
  { key: 'r90',
    metricKey: 'inc_count_napadenie_na_obekt_sotrudnikov_ne_predotvraschennyy', label: 'не предотвращенные', rule: { type: 'INCIDENT_COUNT_BY_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', subTypeTitle: 'Не предотвращенный' } },
  { key: 'r91',
    metricKey: 'inc_count_napadenie_na_obekt_sotrudnikov_predotvraschennye', label: 'предотвращенные', rule: { type: 'INCIDENT_COUNT_BY_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', subTypeTitle: 'Предотвращенные' } },
  { key: 'r92',
    metricKey: 'add_napadenie_na_obekt_sotrudnikov_punishment_detained_persons_count', label: 'Задержаны лица при совершении правонарушения (нападение)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', container: 'punishment', field: 'detained_persons_count' } },
  { key: 'r93',
    metricKey: 'add_napadenie_na_obekt_sotrudnikov_financial_detected_damage', label: 'Установлена сумма причиненного ущерба (руб.) БПО', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', container: 'financial', field: 'detected_damage' } },
  { key: 'r94',
    metricKey: 'add_napadenie_na_obekt_sotrudnikov_financial_prevented_damage', label: 'Предотвращен ущерб на сумму (руб.) (нападение)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', container: 'financial', field: 'prevented_damage' } },
  { key: 'r95',
    metricKey: 'add_napadenie_na_obekt_sotrudnikov_financial_recovered_damage', label: 'Возмещен ущерб на сумму (руб.) (нападение)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', container: 'financial', field: 'recovered_damage' } },
  { key: 'r96',
    metricKey: 'add_napadenie_na_obekt_sotrudnikov_punishment_employees_involved_count', label: 'Установлено сотрудников, причастных к проникновению (нападение)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', container: 'punishment', field: 'employees_involved_count' } },
  { key: 'r97',
    metricKey: 'add_pun_sum_napadenie_na_obekt_sotrudnikov', label: 'наложено взысканий (нападение)', rule: { type: 'ADDITIONALLY_PUNISHMENT_SUM_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', fields: ['warning_letter_rp398', 'remark', 'reprimand'] } },
  { key: 'r98',
    metricKey: 'add_napadenie_na_obekt_sotrudnikov_punishment_dismissed_count', label: 'уволено с работы (нападение)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', container: 'punishment', field: 'dismissed_count' } },
  { key: 'r99',
    metricKey: 'add_crim_napadenie_na_obekt_sotrudnikov_transferred', label: 'Передано материалов в правоохранительные органы (нападение)', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', condition: 'transferred' } },
  { key: 'r100',
    metricKey: 'add_crim_napadenie_na_obekt_sotrudnikov_opened', label: 'Возбуждено уголовных дел (нападение)', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', condition: 'opened' } },
  { key: 'r101',
    metricKey: 'add_crim_napadenie_na_obekt_sotrudnikov_closed', label: 'Окончено уголовных дел (нападение)', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Нападение на объект/сотрудников', condition: 'closed' } },
  // 102–114: Кражи
  { key: 'r102',
    metricKey: 'inc_sum_krazhi', label: 'Кража (акт вандализма)', rule: { type: 'INCIDENT_SUM_BY_TYPE', eventTypeTitle: 'Кражи' } },
  { key: 'r103',
    metricKey: 'inc_count_krazhi_ne_predotvraschennyy', label: 'не предотвращенные (кражи)', rule: { type: 'INCIDENT_COUNT_BY_TYPE', eventTypeTitle: 'Кражи', subTypeTitle: 'Не предотвращенный' } },
  { key: 'r104',
    metricKey: 'inc_count_krazhi_predotvraschennye', label: 'предотвращенные (кражи)', rule: { type: 'INCIDENT_COUNT_BY_TYPE', eventTypeTitle: 'Кражи', subTypeTitle: 'Предотвращенные' } },
  { key: 'r105',
    metricKey: 'add_krazhi_punishment_detained_persons_count', label: 'Задержаны лица при совершении правонарушения (кражи)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', container: 'punishment', field: 'detained_persons_count' } },
  { key: 'r106',
    metricKey: 'add_krazhi_financial_detected_damage', label: 'Установлена сумма причиненного ущерба (руб.) (кражи)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', container: 'financial', field: 'detected_damage' } },
  { key: 'r107',
    metricKey: 'add_krazhi_financial_prevented_damage', label: 'Предотвращен ущерб на сумму (руб.) (кражи)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', container: 'financial', field: 'prevented_damage' } },
  { key: 'r108',
    metricKey: 'add_krazhi_financial_recovered_damage', label: 'Возмещен ущерб на сумму (руб.) (кражи)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', container: 'financial', field: 'recovered_damage' } },
  { key: 'r109',
    metricKey: 'add_krazhi_punishment_employees_involved_count', label: 'Установлено сотрудников, причастных к проникновению (кражи)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', container: 'punishment', field: 'employees_involved_count' } },
  { key: 'r110',
    metricKey: 'add_pun_sum_krazhi', label: 'наложено взысканий (кражи)', rule: { type: 'ADDITIONALLY_PUNISHMENT_SUM_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', fields: ['warning_letter_rp398', 'remark', 'reprimand'] } },
  { key: 'r111',
    metricKey: 'add_krazhi_punishment_dismissed_count', label: 'уволено с работы (кражи)', rule: { type: 'ADDITIONALLY_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', container: 'punishment', field: 'dismissed_count' } },
  { key: 'r112',
    metricKey: 'add_crim_krazhi_transferred', label: 'Передано материалов в правоохранительные органы (кражи)', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', condition: 'transferred' } },
  { key: 'r113',
    metricKey: 'add_crim_krazhi_opened', label: 'Возбуждено уголовных дел (кражи)', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', condition: 'opened' } },
  { key: 'r114',
    metricKey: 'add_crim_krazhi_closed', label: 'Окончено уголовных дел (кражи)', rule: { type: 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE', eventTypeTitle: 'Кражи', condition: 'closed' } },
  // 115–121: Травма, смертельный исход, ДТП, пожар, проверки БПиО
  { key: 'r115',
    metricKey: 'trauma_injury', label: 'Травмировано', rule: { type: 'INCIDENT_EVENT_TRAUMA', outcome: 'injury' } },
  { key: 'r116',
    metricKey: 'trauma_injury_employee', label: 'из них сотрудники (травма)', rule: { type: 'INCIDENT_EVENT_TRAUMA', outcome: 'injury', employeeOnly: true } },
  { key: 'r117',
    metricKey: 'trauma_death', label: 'Смертельный исход', rule: { type: 'INCIDENT_EVENT_TRAUMA', outcome: 'death' } },
  { key: 'r118',
    metricKey: 'trauma_death_employee', label: 'из них сотрудники (смертельный исход)', rule: { type: 'INCIDENT_EVENT_TRAUMA', outcome: 'death', employeeOnly: true } },
  { key: 'r119',
    metricKey: 'inc_etype_dtp_s_uchastiem_sotrudnikov_ili_sluzhebnogo_transporta', label: 'ДТП с участием сотрудников или служебного транспорта', rule: { type: 'INCIDENT_COUNT_EVENT_TYPE', eventTypeTitle: 'ДТП с участием сотрудников или служебного транспорта' } },
  { key: 'r120',
    metricKey: 'inc_etype_pozhary_vozgoraniya', label: 'Пожар', rule: { type: 'INCIDENT_COUNT_EVENT_TYPE', eventTypeTitle: 'Пожары/возгорания' } },
  { key: 'r121',
    metricKey: 'event_count_is_service_investigation_bpio', label: 'Проведено проверок и СР БПиО', rule: { type: 'EVENT_COUNT_BOOLEAN', flag: 'is_service_investigation_bpio' } },
  { key: 'r122',
    metricKey: 'event_bools_sum_is_service_check_bpio_is_service_investigation_bpio', label: 'в том числе по обращениям на «горячую линию»', rule: { type: 'EVENT_COUNT_BOOLEANS_SUM', flags: ['is_service_check_bpio', 'is_service_investigation_bpio'] } },
  { key: 'r123',
    metricKey: 'oa_security_categorized_rooms_count', label: 'Количество категорированных помещений', rule: { type: 'OA_FIELD', direction: 'SECURITY', category: 'OBJECTS_COUNT', field: 'categorized_rooms_count' } },
  { key: 'r124',
    metricKey: 'event_all_bools_is_service_check_ib_is_service_investigation_ib', label: 'проведено проверок и служебных расследований по инцидентам ИБ (кол-во)', rule: { type: 'EVENT_COUNT_ALL_BOOLEANS', flags: ['is_service_check_ib', 'is_service_investigation_ib'] } },
  // 125–160: ИБ
  { key: 'r125',
    metricKey: 'oa_information_planned_ib_checks', label: 'проведено плановых проверок ИБ (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INSPECTIONS', field: 'planned_ib_checks' } },
  { key: 'r126',
    metricKey: 'oa_information_non_compliances', label: 'выявлено несоответствий нормативным документам (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INSPECTIONS', field: 'non_compliances' } },
  { key: 'r127',
    metricKey: 'oa_sum_information_violators_measures', label: 'Меры, принятые к нарушителям', rule: { type: 'OA_SUM_FIELDS', direction: 'INFORMATION', category: 'VIOLATORS_MEASURES', fields: ['warnings', 'remarks', 'reprimands', 'dismissals'] } },
  { key: 'r128',
    metricKey: 'oa_information_warnings', label: 'предупреждение (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'VIOLATORS_MEASURES', field: 'warnings' } },
  { key: 'r129',
    metricKey: 'oa_information_remarks', label: 'замечание (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'VIOLATORS_MEASURES', field: 'remarks' } },
  { key: 'r130',
    metricKey: 'oa_information_reprimands', label: 'выговор (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'VIOLATORS_MEASURES', field: 'reprimands' } },
  { key: 'r131',
    metricKey: 'oa_information_dismissals', label: 'увольнение по соответствующим основаниям (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'VIOLATORS_MEASURES', field: 'dismissals' } },
  { key: 'r132',
    metricKey: 'oa_information_approved_accesses', label: 'Количество согласованных доступов к информационным активам', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'ACCESS_APPROVALS', field: 'approved_accesses' } },
  { key: 'r133',
    metricKey: 'oa_information_memos_count', label: 'Подготовлено служебных записок руководству', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'MEMOS_PREPARED', field: 'memos_count' } },
  { key: 'r134',
    metricKey: 'oa_sum_information_risk_minimization', label: 'События и мероприятия, связанные с минимизацией рисков и угроз в информационной сфере', rule: { type: 'OA_SUM_FIELDS', direction: 'INFORMATION', category: 'RISK_MINIMIZATION', fields: ['audit_security_control_count', 'work_status_result_count', 'scanned_count', 'vulnerabilities_found'] } },
  { key: 'r135',
    metricKey: 'oa_information_audit_security_control_count', label: 'Проведение аудита и контроль защищённости информационной инфраструктуры ИС', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'RISK_MINIMIZATION', field: 'audit_security_control_count' } },
  { key: 'r136',
    metricKey: 'oa_information_work_status_result_count', label: 'Описание статуса и/или результата проводимых работ в рамках данной задачи', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'RISK_MINIMIZATION', field: 'work_status_result_count' } },
  { key: 'r137',
    metricKey: 'oa_information_scanned_count', label: 'Проведено /просканировано (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'RISK_MINIMIZATION', field: 'scanned_count' } },
  { key: 'r138',
    metricKey: 'oa_information_vulnerabilities_found', label: 'Выявлено уязвимостей (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'RISK_MINIMIZATION', field: 'vulnerabilities_found' } },
  { key: 'r139',
    metricKey: 'oa_information_ct_ki_protection_count', label: 'Реализация режима защиты КТ и КИ', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'CT_KI_PROTECTION', field: 'ct_ki_protection_count' } },
  { key: 'r140',
    metricKey: 'oa_information_confidential_docs', label: 'Зарегистрировано конфиденциальных документов (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'CT_KI_PROTECTION', field: 'confidential_docs' } },
  { key: 'r141',
    metricKey: 'oa_information_compliance_checks', label: 'Проведено проверок на соответствие нормативным документам (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'CT_KI_PROTECTION', field: 'compliance_checks' } },
  { key: 'r142',
    metricKey: 'oa_information_awareness_count', label: 'Повышение осведомленности в области ИБ сотрудников компании', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'AWARENESS_RAISING', field: 'awareness_count' } },
  { key: 'r143',
    metricKey: 'oa_sum_information_access_control', label: 'Контроль доступа к ИС и действий привилегированных пользователей', rule: { type: 'OA_SUM_FIELDS', direction: 'INFORMATION', category: 'ACCESS_CONTROL', fields: ['access_requests', 'access_violations', 'account_audits', 'violations_found'] } },
  { key: 'r144',
    metricKey: 'oa_information_access_requests', label: 'Рассмотрено заявок на предоставление доступа к ИС (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'ACCESS_CONTROL', field: 'access_requests' } },
  { key: 'r145',
    metricKey: 'oa_information_access_violations', label: 'Зафиксировано нарушений предоставления доступа к ИС (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'ACCESS_CONTROL', field: 'access_violations' } },
  { key: 'r146',
    metricKey: 'oa_information_account_audits', label: 'Проведено аудитов учетных записей (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'ACCESS_CONTROL', field: 'account_audits' } },
  { key: 'r147',
    metricKey: 'oa_information_violations_found', label: 'Выявлено нарушений (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'ACCESS_CONTROL', field: 'violations_found' } },
  { key: 'r148',
    metricKey: 'oa_information_processed_incidents', label: 'Обработано инцидентов ИБ (кол-во), из них', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'processed_incidents' } },
  { key: 'r149',
    metricKey: 'oa_information_admin_rights_incidents', label: 'инцидентов, связанных с нарушением процедур предоставления административных прав (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'admin_rights_incidents' } },
  { key: 'r150',
    metricKey: 'oa_information_kspd_access_incidents', label: 'инцидентов по подозрению в нелегитимном доступе в КСПД (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'kspd_access_incidents' } },
  { key: 'r151',
    metricKey: 'oa_information_spam_incidents', label: 'инцидентов по подозрению внутренней спам-активности (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'spam_incidents' } },
  { key: 'r152',
    metricKey: 'oa_information_virus_incidents', label: 'инцидентов, связанных с вирусной активностью (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'virus_incidents' } },
  { key: 'r153',
    metricKey: 'oa_information_software_incidents', label: 'инцидентов, связанных с выявлением некорпоративного, нелицензионного, вредоносного ПО (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'software_incidents' } },
  { key: 'r154',
    metricKey: 'oa_information_ki_pdn_incidents', label: 'инцидентов, связанных с нарушениями порядка обработки КИ и ПДн (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'ki_pdn_incidents' } },
  { key: 'r155',
    metricKey: 'oa_information_network_attacks_incidents', label: 'инцидентов по подозрению в сетевых атаках (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'network_attacks_incidents' } },
  { key: 'r156',
    metricKey: 'oa_information_leaks_found', label: 'выявлено утечек КИ или информации, составляющей КТ (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'leaks_found' } },
  { key: 'r157',
    metricKey: 'oa_information_blocked_threats', label: 'в рамках мониторинга инцидентов ИБ заблокировано (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'blocked_threats' } },
  { key: 'r158',
    metricKey: 'oa_information_other_incidents', label: 'другие инциденты ИБ (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INCIDENT_MONITORING', field: 'other_incidents' } },
  { key: 'r159',
    metricKey: 'oa_information_fraud_incidents', label: 'Выявлено инцидентов фрода, находящихся в зоне ответственности ИБ (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'FRAUD_PREVENTION', field: 'fraud_incidents' } },
  { key: 'r160',
    metricKey: 'oa_information_analyzed_documents', label: 'Обработано документов в рамках участия в составах проектных рабочих групп компании (кол-во)', rule: { type: 'OA_FIELD', direction: 'INFORMATION', category: 'INFRASTRUCTURE_ANALYSIS', field: 'analyzed_documents' } },
];

/** Маппинг direction -> category для OA (категория в БД хранится не в OA, а задаётся полями; для отбора по направлению используем direction) */
export const OA_CATEGORY_FIELDS: Record<string, string[]> = {
  ECONOMIC_DEBT_RECOVERY: ['total_debt', 'overdue_debt', 'overdue_debt_sb', 'recovered_debt', 'available_vat', 'vat_assistance', 'written_off_debt', 'prevented_writeoff'],
  ECONOMIC_INVESTMENT_CONTROL: ['checked_entities_new', 'negative_conclusions_new', 'checked_entities_active', 'negative_conclusions_active', 'checked_draft_contracts', 'not_approved_drafts', 'checked_active_contracts', 'not_approved_active', 'planned_budget', 'procurement_procedures_count', 'single_source_count', 'procurement_procedures_sum', 'single_source_sum', 'cost_reduction'],
  ECONOMIC_AFFILIATION: ['checked_employees', 'found_affiliated', 'checked_candidates', 'rejected_candidates', 'rejected_affiliated'],
  ECONOMIC_CITIZEN_APPEALS: ['total_appeals', 'zon_applications', 'fictitious_contracts', 'termination_requests', 'beautiful_numbers', 'sim_replacement', 'refund_requests', 'other_appeals'],
  CYBER_CYBER_LAW_ENFORCEMENT: ['cyber_incoming_paper_requests', 'cyber_executed_paper_requests', 'cyber_executed_paper_tasks', 'cyber_received_presentations', 'cyber_executed_presentations'],
  SECURITY_STAFF_COUNT: ['staff_count'],
  SECURITY_OBJECTS_COUNT: ['objects_count', 'objects_physical_security', 'objects_panel_security', 'categorized_rooms_count'],
  SECURITY_CAPEX_BUDGET: ['capex_allocated', 'capex_spent_current'],
  SECURITY_OPEX_BUDGET: ['opex_allocated'],
  SECURITY_ATZ_INSPECTIONS: ['atz_checks_pb', 'atz_checks_law'],
  SECURITY_ATU_ATT: ['atu_att_pb', 'atu_att_law'],
  SECURITY_SECURITY_COMPANY: ['chop_checks', 'chop_claims'],
  INFORMATION_INSPECTIONS: ['ib_incident_checks', 'planned_ib_checks', 'non_compliances'],
  INFORMATION_VIOLATORS_MEASURES: ['warnings', 'remarks', 'reprimands', 'dismissals'],
  INFORMATION_ACCESS_APPROVALS: ['approved_accesses'],
  INFORMATION_MEMOS_PREPARED: ['memos_count'],
  INFORMATION_RISK_MINIMIZATION: ['audit_security_control_count', 'work_status_result_count', 'scanned_count', 'vulnerabilities_found'],
  INFORMATION_CT_KI_PROTECTION: ['ct_ki_description', 'confidential_docs', 'compliance_checks', 'ct_ki_protection_count'],
  INFORMATION_AWARENESS_RAISING: ['awareness_description', 'awareness_count'],
  INFORMATION_ACCESS_CONTROL: ['access_control_description', 'access_requests', 'access_violations', 'account_audits', 'violations_found'],
  INFORMATION_INCIDENT_MONITORING: ['processed_incidents', 'admin_rights_incidents', 'kspd_access_incidents', 'spam_incidents', 'virus_incidents', 'software_incidents', 'ki_pdn_incidents', 'network_attacks_incidents', 'leaks_found', 'blocked_threats', 'other_incidents'],
  INFORMATION_FRAUD_PREVENTION: ['fraud_incidents', 'fraud_description'],
  INFORMATION_INFRASTRUCTURE_ANALYSIS: ['analyzed_documents'],
};


/** Normalize label for Excel import matching */
export function normalizeReportLabel(label: string): string {
  return String(label || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Resolve field by legacy key or semantic metricKey */
export function findReportField(keyOrMetric: string): ReportFieldDef | undefined {
  return REPORT_FIELDS.find((f) => f.key === keyOrMetric || f.metricKey === keyOrMetric);
}

/** Resolve many keys (legacy or semantic) to field defs preserving order */
export function resolveReportFields(keys: string[]): ReportFieldDef[] {
  const out: ReportFieldDef[] = [];
  for (const k of keys) {
    const def = findReportField(k);
    if (def) out.push(def);
  }
  return out;
}

/** Map normalized label → list of defs (duplicate labels keep order) */
export function getReportFieldsByNormalizedLabel(): Map<string, ReportFieldDef[]> {
  const map = new Map<string, ReportFieldDef[]>();
  for (const def of REPORT_FIELDS) {
    const n = normalizeReportLabel(def.label);
    const list = map.get(n) ?? [];
    list.push(def);
    map.set(n, list);
  }
  return map;
}
