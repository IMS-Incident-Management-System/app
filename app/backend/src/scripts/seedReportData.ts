#!/usr/bin/env ts-node

/**
 * Сидер для заполнения базы данных тестовыми данными для проверки отчетов
 * 
 * Использование:
 *   npm run seed:report
 */

import dotenv from 'dotenv';
import { sequelize } from '../models/sequelize';
import { QueryTypes } from 'sequelize';
import Incident, { SecurityDirectionEnum, IncidentCreationAttributes, IncidentInstance } from '../models/incident';
import IncidentEvent, { IncidentEventCreationAttributes } from '../models/incidentEvent';
import Additionally, { AdditionallyCreationAttributes } from '../models/additionally';
import CriminalCase, { CriminalCaseCreationAttributes } from '../models/criminalCase';
import Punishment, { PunishmentCreationAttributes } from '../models/punishment';
import AdditionallyPerson, { AdditionallyPersonCreationAttributes } from '../models/additionallyPerson';
import IncidentEventType from '../models/incidentEventType';
import Event, { EventCreationAttributes, EventInstance } from '../models/event';
import OperationalActivity, { OperationalActivityCreationAttributes, OperationalActivityInstance } from '../models/operationalActivity';
import { OperationalActivityDirectionEnum } from '../enums/operationalActivity';
import Department from '../models/department';

dotenv.config();

// Функция для получения случайной даты в диапазоне
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Функция для получения случайного элемента из массива
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Функция для получения случайного числа в диапазоне
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedReportData() {
  try {
    console.log('🔌 Подключение к базе данных...');
    await sequelize.authenticate();
    console.log('✅ Подключение установлено\n');

    // Получаем все департаменты
    const departments = await Department.findAll();
    if (departments.length === 0) {
      console.error('❌ Нет департаментов в базе данных. Сначала создайте департаменты.');
      process.exit(1);
    }

    const departmentIds = departments.map(d => d.department_id);
    console.log(`📋 Найдено департаментов: ${departmentIds.length}\n`);

    // Тип события инцидента для дополнений (корневой тип, если есть)
    const rootEventType = await IncidentEventType.findOne({ where: { parent_id: null } });
    const defaultEventTypeId = rootEventType?.event_type_id ?? null;

    // Очищаем существующие данные (порядок: зависимые от инцидентов → инциденты → события → ОД)
    console.log('🗑️  Очистка существующих данных...');
    await CriminalCase.destroy({ where: {}, force: true });
    await Punishment.destroy({ where: {}, force: true });
    await AdditionallyPerson.destroy({ where: {}, force: true });
    await Additionally.destroy({ where: {}, force: true });
    await IncidentEvent.destroy({ where: {}, force: true });
    await Incident.destroy({ where: {}, force: true });
    await Event.destroy({ where: {}, force: true });
    await OperationalActivity.destroy({ where: {}, force: true });
    console.log('✅ Данные очищены\n');

    // Создаем инциденты
    console.log('📝 Создание инцидентов...');
    const incidents: IncidentInstance[] = [];
    const years = [2023, 2024, 2025];
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Все месяцы

    const ADDITIONS_PER_INCIDENT = 3;

    for (let i = 0; i < 300; i++) {
      const year = randomElement(years);
      const month = randomElement(months);
      const day = randomInt(1, 28);
      const date = new Date(year, month, day);

      const incidentData: IncidentCreationAttributes = {
        department_id: randomElement(departmentIds),
        direction: randomElement(Object.values(SecurityDirectionEnum)) as SecurityDirectionEnum,
        is_db: Math.random() > 0.8, // 20% особо важных
        description: `Тестовый инцидент ${i + 1}`,
        // Всегда ненулевые значения
        detected_damage: randomInt(10000, 1000000),
        recovered_damage: randomInt(5000, 500000),
        prevented_damage: randomInt(20000, 2000000),
        additional_income: randomInt(10000, 500000),
        reduced_cost: randomInt(5000, 300000),
      };

      const incident = await Incident.create(incidentData);

      // Устанавливаем createdAt и updatedAt вручную через SQL
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 12:00:00`;
      await sequelize.query(
        `UPDATE incidents SET "createdAt" = '${dateStr}', "updatedAt" = '${dateStr}' WHERE id = ${incident.id}`
      );

      incidents.push(incident);

      // Создаём минимум 3 дополнения к инциденту со всеми полями
      for (let a = 0; a < ADDITIONS_PER_INCIDENT; a++) {
        const addDay = ((day - 1 + a) % 28) + 1;
        const addDate = new Date(year, month, addDay);
        const addDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(addDay).padStart(2, '0')} 12:00:00`;

        const eventData: IncidentEventCreationAttributes = {
          incident_id: incident.id,
          event_type_id: defaultEventTypeId,
          date: addDate,
          entry_date: addDate,
          description: `Дополнение ${a + 1} к инциденту ${i + 1}`,
          city: `Город ${randomInt(1, 50)}`,
          street: `Ул. Тестовая ${randomInt(1, 100)}`,
          house: String(randomInt(1, 99)),
          building: randomInt(1, 5) > 3 ? String(randomInt(1, 10)) : undefined,
          number: String(randomInt(1, 500)),
          last_name: `Фамилия${i}_${a}`,
          first_name: `Имя${i}_${a}`,
          middle_name: `Отчество${i}_${a}`,
          employee_number: `TN-${randomInt(10000, 99999)}`,
        };
        const incidentEvent = await IncidentEvent.create(eventData);
        await sequelize.query(
          `UPDATE incident_events SET "createdAt" = '${addDateStr}', "updatedAt" = '${addDateStr}' WHERE id = ${incidentEvent.id}`
        );

        const additionallyData: AdditionallyCreationAttributes = {
          incident_id: incident.id,
          incident_event_id: incidentEvent.id,
          incident_date: addDate,
          addition_date: addDate,
          text_field: `Текст дополнения ${a + 1} к инциденту ${i + 1}. Описание обстоятельств.`,
          detected_damage: randomInt(5000, 300000),
          prevented_damage: randomInt(10000, 400000),
          recovered_damage: randomInt(3000, 200000),
          additional_income: randomInt(5000, 150000),
          reduced_cost: randomInt(2000, 100000),
        };
        const addition = await Additionally.create(additionallyData);

        const criminalCaseData: CriminalCaseCreationAttributes = {
          additionally_id: addition.id,
          transfer_date: addDate,
          document_number: `Док-${year}-${randomInt(1000, 9999)}`,
          department_name: `Подразделение ${randomInt(1, 20)}`,
          review_result: `Рассмотрение материалов по дополнению ${a + 1}`,
          rejection_date: randomInt(1, 5) > 3 ? addDate : undefined,
          rejection_reason: randomInt(1, 5) > 4 ? 'Причина отказа' : undefined,
          appeal_date: undefined,
          case_date: addDate,
          case_number: `УД-${randomInt(100, 999)}/${year}`,
          law_article: `ст. ${randomInt(158, 165)} УК РФ`,
          initiator: `Инициатор ${randomInt(1, 10)}`,
          subject: `Субъект преступления по дополнению ${a + 1}`,
          detained_count: randomInt(0, 3),
          person_name: `ФИО привлекаемого ${i}_${a}`,
          case_result: `Результат рассмотрения по дополнению ${a + 1}`,
          court_decision: `Решение суда по делу ${a + 1}`,
          convicted_count: randomInt(0, 2),
        };
        await CriminalCase.create(criminalCaseData);

        const punishmentData: PunishmentCreationAttributes = {
          additionally_id: addition.id,
          guilty_persons_count: randomInt(1, 4),
          employees_involved_count: randomInt(0, 2),
          detained_persons_count: randomInt(0, 2),
          measures_taken_count: randomInt(1, 5),
          warning_letter_rp398: randomInt(0, 2),
          remark: randomInt(0, 2),
          reprimand: randomInt(0, 2),
          dismissed_count: randomInt(0, 1),
        };
        await Punishment.create(punishmentData);

        for (let p = 0; p < 2; p++) {
          const personBirthYear = year - randomInt(25, 55);
          const personData: AdditionallyPersonCreationAttributes = {
            additionally_id: addition.id,
            last_name: `ФамилияФ${i}_${a}_${p}`,
            first_name: `ИмяФ${i}_${a}_${p}`,
            middle_name: `ОтчФ${i}_${a}_${p}`,
            birth_date: new Date(personBirthYear, randomInt(0, 11), randomInt(1, 28)),
            employee_number: `TN-${randomInt(1000, 9999)}-${p}`,
          };
          await AdditionallyPerson.create(personData);
        }
      }
    }
    console.log(`✅ Создано инцидентов: ${incidents.length} (у каждого минимум ${ADDITIONS_PER_INCIDENT} дополнения со всеми полями)\n`);

    // Создаем события
    console.log('📝 Создание событий...');
    const events: EventInstance[] = [];

    // События с is_service_investigation = true
    for (let i = 0; i < 50; i++) {
      const year = randomElement(years);
      const month = randomElement(months);
      const day = randomInt(1, 28);
      const date = new Date(year, month, day);

      const eventData: EventCreationAttributes = {
        department_id: randomElement(departmentIds),
        date: date,
        is_service_investigation: true,
        is_service_investigation_ib: false,
        is_service_investigation_bpio: false,
        is_service_investigation_bpio_hotline: false,
        is_service_check: false,
        is_service_check_ib: false,
        is_service_check_bpio: false,
        is_service_check_bpio_hotline: false,
        is_verification_activity: false,
        is_db: false,
        description: `Служебное расследование ${i + 1}`,
        detected_damage: randomInt(10000, 500000),
        recovered_damage: randomInt(5000, 200000),
        prevented_damage: randomInt(15000, 800000),
        additional_income: randomInt(10000, 300000),
        prevented_unnecessary_writeoff: randomInt(50000, 500000),
        vat_deducted: randomInt(100000, 2000000),
      };

      const event = await Event.create(eventData);

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 12:00:00`;
      await sequelize.query(
        `UPDATE events SET "createdAt" = '${dateStr}', "updatedAt" = '${dateStr}' WHERE id = ${event.id}`
      );

      events.push(event);
    }

    // События с is_service_check = true
    for (let i = 0; i < 40; i++) {
      const year = randomElement(years);
      const month = randomElement(months);
      const day = randomInt(1, 28);
      const date = new Date(year, month, day);

      const eventData: EventCreationAttributes = {
        department_id: randomElement(departmentIds),
        date: date,
        is_service_investigation: false,
        is_service_investigation_ib: false,
        is_service_investigation_bpio: false,
        is_service_investigation_bpio_hotline: false,
        is_service_check: true,
        is_service_check_ib: false,
        is_service_check_bpio: false,
        is_service_check_bpio_hotline: false,
        is_verification_activity: false,
        is_db: false,
        description: `Служебная проверка ${i + 1}`,
        detected_damage: randomInt(8000, 400000),
        recovered_damage: randomInt(4000, 150000),
        prevented_damage: randomInt(12000, 600000),
        additional_income: randomInt(8000, 250000),
        prevented_unnecessary_writeoff: randomInt(40000, 400000),
        vat_deducted: randomInt(80000, 1500000),
      };

      const event = await Event.create(eventData);

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 12:00:00`;
      await sequelize.query(
        `UPDATE events SET "createdAt" = '${dateStr}', "updatedAt" = '${dateStr}' WHERE id = ${event.id}`
      );

      events.push(event);
    }

    // События с is_service_check_ib = true
    for (let i = 0; i < 35; i++) {
      const year = randomElement(years);
      const month = randomElement(months);
      const day = randomInt(1, 28);
      const date = new Date(year, month, day);

      const eventData: EventCreationAttributes = {
        department_id: randomElement(departmentIds),
        date: date,
        is_service_investigation: false,
        is_service_investigation_ib: false,
        is_service_investigation_bpio: false,
        is_service_investigation_bpio_hotline: false,
        is_service_check: false,
        is_service_check_ib: true,
        is_service_check_bpio: false,
        is_service_check_bpio_hotline: false,
        is_verification_activity: false,
        is_db: false,
        description: `Служебная проверка по ИБ ${i + 1}`,
        detected_damage: randomInt(15000, 600000),
        recovered_damage: randomInt(7000, 300000),
        prevented_damage: randomInt(20000, 1000000),
        additional_income: randomInt(12000, 400000),
        prevented_unnecessary_writeoff: randomInt(60000, 600000),
        vat_deducted: randomInt(120000, 2500000),
      };

      const event = await Event.create(eventData);

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 12:00:00`;
      await sequelize.query(
        `UPDATE events SET "createdAt" = '${dateStr}', "updatedAt" = '${dateStr}' WHERE id = ${event.id}`
      );

      events.push(event);
    }

    // События с is_verification_activity = true
    for (let i = 0; i < 50; i++) {
      const year = randomElement(years);
      const month = randomElement(months);
      const day = randomInt(1, 28);
      const date = new Date(year, month, day);

      const eventData: EventCreationAttributes = {
        department_id: randomElement(departmentIds),
        date: date,
        is_service_investigation: false,
        is_service_investigation_ib: false,
        is_service_investigation_bpio: false,
        is_service_investigation_bpio_hotline: false,
        is_service_check: false,
        is_service_check_ib: false,
        is_service_check_bpio: false,
        is_service_check_bpio_hotline: false,
        is_verification_activity: true,
        is_db: false,
        description: `Проверочное мероприятие ${i + 1}`,
        detected_damage: randomInt(20000, 800000),
        recovered_damage: randomInt(10000, 400000),
        prevented_damage: randomInt(25000, 1200000),
        additional_income: randomInt(15000, 500000),
        prevented_unnecessary_writeoff: randomInt(80000, 800000),
        vat_deducted: randomInt(150000, 3000000),
      };

      const event = await Event.create(eventData);

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 12:00:00`;
      await sequelize.query(
        `UPDATE events SET "createdAt" = '${dateStr}', "updatedAt" = '${dateStr}' WHERE id = ${event.id}`
      );

      events.push(event);
    }

    // События с финансовыми полями
    for (let i = 0; i < 80; i++) {
      const year = randomElement(years);
      const month = randomElement(months);
      const day = randomInt(1, 28);
      const date = new Date(year, month, day);

      const eventData: EventCreationAttributes = {
        department_id: randomElement(departmentIds),
        date: date,
        is_service_investigation: false,
        is_service_investigation_ib: false,
        is_service_investigation_bpio: false,
        is_service_investigation_bpio_hotline: false,
        is_service_check: false,
        is_service_check_ib: false,
        is_service_check_bpio: false,
        is_service_check_bpio_hotline: false,
        is_verification_activity: false,
        is_db: false,
        description: `Событие с финансовыми данными ${i + 1}`,
        detected_damage: randomInt(50000, 2000000),
        recovered_damage: randomInt(25000, 1000000),
        prevented_damage: randomInt(100000, 5000000),
        additional_income: randomInt(30000, 1500000),
        prevented_unnecessary_writeoff: randomInt(100000, 2000000),
        vat_deducted: randomInt(200000, 5000000),
      };

      const event = await Event.create(eventData);

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 12:00:00`;
      await sequelize.query(
        `UPDATE events SET "createdAt" = '${dateStr}', "updatedAt" = '${dateStr}' WHERE id = ${event.id}`
      );

      events.push(event);
    }

    console.log(`✅ Создано событий: ${events.length}\n`);

    // Создаем операционную деятельность
    console.log('📝 Создание операционной деятельности...');
    const operationalActivities: OperationalActivityInstance[] = [];

    // Операционная деятельность - DEBT_RECOVERY (группа 2)
    for (let i = 0; i < 60; i++) {
      const year = randomElement(years);
      const month = randomElement(months);
      const day = randomInt(1, 28);
      const date = new Date(year, month, day);
      const periodFrom = new Date(year, month, 1);
      const periodTo = new Date(year, month, 28);

      const oaData: OperationalActivityCreationAttributes = {
        department_id: randomElement(departmentIds),
        direction: OperationalActivityDirectionEnum.ECONOMIC,
        period_from: periodFrom,
        period_to: periodTo,
        description: `Работа по возмещению ДЗ и НДС ${i + 1}`,
        total_debt: randomInt(1000000, 50000000),
        overdue_debt: randomInt(500000, 30000000),
        overdue_debt_sb: randomInt(200000, 15000000),
        recovered_debt: randomInt(100000, 10000000),
        available_vat: randomInt(500000, 20000000),
        vat_assistance: randomInt(10, 100),
        written_off_debt: randomInt(50000, 5000000),
        prevented_writeoff: randomInt(5, 50),
      };

      const oa = await OperationalActivity.create(oaData);

      // Устанавливаем createdAt и updatedAt вручную через SQL
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 12:00:00`;
      await sequelize.query(
        `UPDATE operational_activities SET "createdAt" = '${dateStr}', "updatedAt" = '${dateStr}' WHERE id = ${oa.id}`
      );

      operationalActivities.push(oa);
    }

    // Операционная деятельность - INVESTMENT_CONTROL (группа 3)
    for (let i = 0; i < 50; i++) {
      const year = randomElement(years);
      const month = randomElement(months);
      const day = randomInt(1, 28);
      const date = new Date(year, month, day);
      const periodFrom = new Date(year, month, 1);
      const periodTo = new Date(year, month, 28);

      const oaData: OperationalActivityCreationAttributes = {
        department_id: randomElement(departmentIds),
        direction: OperationalActivityDirectionEnum.ECONOMIC,
        period_from: periodFrom,
        period_to: periodTo,
        description: `Контроль инвестиционной деятельности ${i + 1}`,
        checked_entities_new: randomInt(5, 200),
        negative_conclusions_new: randomInt(1, 50),
        checked_entities_active: randomInt(10, 300),
        negative_conclusions_active: randomInt(2, 80),
        checked_draft_contracts: randomInt(20, 500),
        not_approved_drafts: randomInt(3, 100),
        checked_active_contracts: randomInt(15, 400),
      };

      const oa = await OperationalActivity.create(oaData);

      // Устанавливаем createdAt и updatedAt вручную через SQL
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 12:00:00`;
      await sequelize.query(
        `UPDATE operational_activities SET "createdAt" = '${dateStr}', "updatedAt" = '${dateStr}' WHERE id = ${oa.id}`
      );

      operationalActivities.push(oa);
    }

    console.log(`✅ Создано операционной деятельности: ${operationalActivities.length}\n`);

    console.log('✅ Сидер успешно выполнен!');
    console.log(`\n📊 Итого создано:`);
    console.log(`   - Инцидентов: ${incidents.length}`);
    console.log(`   - Событий: ${events.length}`);
    console.log(`   - Операционной деятельности: ${operationalActivities.length}`);
    console.log(`\n🎯 Теперь можно проверить отчеты!`);

  } catch (error) {
    console.error('❌ Ошибка при выполнении сидера:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Запускаем сидер
seedReportData()
  .then(() => {
    console.log('\n✅ Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Ошибка:', error);
    process.exit(1);
  });

