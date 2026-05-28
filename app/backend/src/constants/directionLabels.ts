import { SecurityDirectionEnum } from '../models/incident';
import { OperationalActivityDirectionEnum } from '../enums/operationalActivity';

export const securityDirectionLabels: Record<string, string> = {
  [SecurityDirectionEnum.INFORMATION]: 'ИБ',
  [SecurityDirectionEnum.ECONOMIC]: 'ЭБ',
  [SecurityDirectionEnum.SECURITY]: 'БПиО',
  [SecurityDirectionEnum.CYBER]: 'КБ',
  [SecurityDirectionEnum.ANTIFRAUD]: 'Антифрод',
  [SecurityDirectionEnum.SORM]: 'СОРМ',
};

export const operationalDirectionLabels: Record<string, string> = {
  [OperationalActivityDirectionEnum.INFORMATION]: 'ИБ',
  [OperationalActivityDirectionEnum.ECONOMIC]: 'ЭБ',
  [OperationalActivityDirectionEnum.SECURITY]: 'БПиО',
  [OperationalActivityDirectionEnum.CYBER]: 'КБ',
  [OperationalActivityDirectionEnum.ANTIFRAUD]: 'Антифрод',
  [OperationalActivityDirectionEnum.SORM]: 'СОРМ',
};

export const fieldLabels: Record<string, string> = {
  direction: 'Направление',
  department_id: 'Подразделение',
  description: 'Описание',
  is_db: 'Особо важно (1ДБ)',
  date: 'Дата события',
  period_from: 'Период с',
  period_to: 'Период по',
  object_type_ids: 'Типы объектов',
  financial_fields: 'Финансовые показатели',
  investigation_flags: 'Параметры расследований',
  operational_metrics: 'Показатели операционной деятельности',
};
