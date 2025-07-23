import React from 'react';
import { Form, Input, DatePicker, InputNumber } from 'antd';
import styles from './CriminalCaseForm.module.scss';

interface CriminalCaseFormProps {
  name: number;
}

export const CriminalCaseForm: React.FC<CriminalCaseFormProps> = ({ name }) => {
  return (
    <div className={styles.container}>
      {/* Данные о передаче материалов */}
      <div className={styles.section}>
        <h3>Данные о передаче материалов</h3>
        <Form.Item
          label="Дата передачи материалов"
          name={[name, "transfer_date"]}
          className={styles.formItem}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Номер документа"
          name={[name, "document_number"]}
          className={styles.formItem}
        >
          <InputNumber placeholder="Введите номер вх./исх. документа или КУСП" />
        </Form.Item>

        <Form.Item
          label="Наименование подразделения"
          name={[name, "department_name"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите наименование подразделения" />
        </Form.Item>
      </div>

      {/* Результаты рассмотрения */}
      <div className={styles.section}>
        <h3>Результаты рассмотрения</h3>
        <Form.Item
          label="Результат рассмотрения"
          name={[name, "review_result"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите результат рассмотрения материалов" />
        </Form.Item>

        <Form.Item
          label="Дата отказа"
          name={[name, "rejection_date"]}
          className={styles.formItem}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Причина отказа"
          name={[name, "rejection_reason"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите причину отказа" />
        </Form.Item>

        <Form.Item
          label="Дата обжалования"
          name={[name, "appeal_date"]}
          className={styles.formItem}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </div>

      {/* Данные уголовного/административного дела */}
      <div className={styles.section}>
        <h3>Данные уголовного/административного дела</h3>
        <Form.Item
          label="Дата ВУД/ВАД"
          name={[name, "case_date"]}
          className={styles.formItem}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Номер УД/АД"
          name={[name, "case_number"]}
          className={styles.formItem}
        >
          <InputNumber placeholder="Введите номер дела" />
        </Form.Item>

        <Form.Item
          label="Статья УКРФ/КоАПРФ"
          name={[name, "law_article"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите статью" />
        </Form.Item>

        <Form.Item
          label="Инициатор"
          name={[name, "initiator"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите инициатора возбуждения УД/АД" />
        </Form.Item>

        <Form.Item
          label="Субъект преступления"
          name={[name, "subject"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите субъект преступления" />
        </Form.Item>

        <Form.Item
          label="Задержано (чел.)"
          name={[name, "detained_count"]}
          className={styles.formItem}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </div>

      {/* Данные о привлекаемом лице */}
      <div className={styles.section}>
        <h3>Данные о привлекаемом лице</h3>
        <Form.Item
          label="ФИО/Название юр.лица"
          name={[name, "person_name"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите ФИО лица или название юр.лица" />
        </Form.Item>
      </div>

      {/* Результаты рассмотрения дела */}
      <div className={styles.section}>
        <h3>Результаты рассмотрения дела</h3>
        <Form.Item
          label="Результат рассмотрения"
          name={[name, "case_result"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите результат рассмотрения УД/АД" />
        </Form.Item>

        <Form.Item
          label="Решение суда"
          name={[name, "court_decision"]}
          className={styles.formItem}
        >
          <Input placeholder="Введите решение (приговор) суда" />
        </Form.Item>

        <Form.Item
          label="Осуждено (чел.)"
          name={[name, "convicted_count"]}
          className={styles.formItem}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </div>
    </div>
  );
};
