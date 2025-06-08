import { Modal, Form, Input, DatePicker, Button, Select } from "antd";
import styles from "../incidentProvider.module.scss";

interface CriminalCaseModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const resultOptions = [
  { value: "Pending", label: "В рассмотрении" },
  { value: "Approved", label: "Одобрено" },
  { value: "Rejected", label: "Отклонено" },
];

export const CriminalCaseModal = ({
  visible,
  onOk,
  onCancel,
}: CriminalCaseModalProps) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="УД"
      open={visible}
      onOk={() => {
        form.validateFields().then(() => {
          onOk();
          form.resetFields();
        });
      }}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      okText="Сохранить"
      cancelText="Отмена"
      className={styles.modal}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="transferDate"
          label="Дата передачи материалов в ПРоО"
          rules={[
            { required: true, message: "Дата передачи материалов в ПРоО" },
          ]}
        >
          <DatePicker
            className={styles.datePicker}
            placeholder="Дата передачи материалов в ПРоО"
          />
        </Form.Item>
        <Form.Item
          name="documentNumber"
          label="Номер вх./исх. документа или Номер КУСП"
          rules={[
            {
              required: true,
              message: "Номер вх./исх. документа или Номер КУСП",
            },
          ]}
        >
          <Input
            className={styles.input}
            placeholder="Номер вх./исх. документа или Номер КУСП"
          />
        </Form.Item>
        <Form.Item
          name="departmentName"
          label="Наименование подразделения, куда переданы материалы"
          rules={[
            {
              required: true,
              message: "Наименование подразделения, куда переданы материалы",
            },
          ]}
        >
          <Input
            className={styles.input}
            placeholder="Наименование подразделения, куда переданы материалы"
          />
        </Form.Item>
        <Form.Item
          name="reviewResult"
          label="Результат рассмотрения материалов"
          rules={[
            { required: true, message: "Результат рассмотрения материалов" },
          ]}
        >
          <Select
            className={styles.select}
            placeholder="Результат рассмотрения материалов"
          >
            {resultOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="rejectionDate"
          label="Дата отказа в ВУД/ВАД"
          rules={[{ required: true, message: "Дата отказа в ВУД/ВАД" }]}
        >
          <DatePicker
            className={styles.datePicker}
            placeholder="Дата отказа в ВУД/ВАД"
          />
        </Form.Item>
        <Form.Item
          name="rejectionReason"
          label="Причина отказа в ВУД/ВАД"
          rules={[{ required: true, message: "Причина отказа в ВУД/ВАД" }]}
        >
          <Input
            className={styles.input}
            placeholder="Причина отказа в ВУД/ВАД"
          />
        </Form.Item>
        <Form.Item
          name="appealDate"
          label="Дата обжалования отказа в ВУД/ВАД"
          rules={[
            { required: true, message: "Дата обжалования отказа в ВУД/ВАД" },
          ]}
        >
          <DatePicker
            className={styles.datePicker}
            placeholder="Дата обжалования отказа в ВУД/ВАД"
          />
        </Form.Item>
        <Form.Item
          name="caseDate"
          label="Дата ВУД/ВАД"
          rules={[{ required: true, message: "Дата ВУД/ВАД" }]}
        >
          <DatePicker
            className={styles.datePicker}
            placeholder="Дата ВУД/ВАД"
          />
        </Form.Item>
        <Form.Item
          name="caseNumber"
          label="Номер УД/АД"
          rules={[{ required: true, message: "Номер УД/АД" }]}
        >
          <Input className={styles.input} placeholder="Номер УД/АД" />
        </Form.Item>
        <Form.Item
          name="article"
          label="Статья УКРФ/КоАПРФ"
          rules={[{ required: true, message: "Статья УКРФ/КоАПРФ" }]}
        >
          <Input className={styles.input} placeholder="Статья УКРФ/КоАПРФ" />
        </Form.Item>
        <Form.Item
          name="initiator"
          label="Инициатор возбуждения УД/АД"
          rules={[{ required: true, message: "Инициатор возбуждения УД/АД" }]}
        >
          <Input
            className={styles.input}
            placeholder="Инициатор возбуждения УД/АД"
          />
        </Form.Item>
        <Form.Item
          name="subject"
          label="Субъект преступления УД/АД"
          rules={[{ required: true, message: "Субъект преступления УД/АД" }]}
        >
          <Input
            className={styles.input}
            placeholder="Субъект преступления УД/АД"
          />
        </Form.Item>
        <Form.Item
          name="detainedCount"
          label="Задержано, чел."
          rules={[{ required: true, message: "Задержано, чел." }]}
        >
          <Input
            className={styles.input}
            placeholder="Задержано, чел."
            type="number"
          />
        </Form.Item>
        <Form.Item
          name="personOrEntity"
          label="ФИО лица (название юр.лица), привлекаемого к УО/АО"
          rules={[
            {
              required: true,
              message: "ФИО лица (название юр.лица), привлекаемого к УО/АО",
            },
          ]}
        >
          <Input
            className={styles.input}
            placeholder="ФИО лица (название юр.лица), привлекаемого к УО/АО"
          />
        </Form.Item>
        <Form.Item
          name="caseReviewResult"
          label="Результат рассмотрения УД/АД"
          rules={[{ required: true, message: "Результат рассмотрения УД/АД" }]}
        >
          <Select
            className={styles.select}
            placeholder="Результат рассмотрения УД/АД"
          >
            {resultOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="courtDecision"
          label="Решение (приговор) суда"
          rules={[{ required: true, message: "Решение (приговор) суда" }]}
        >
          <Input
            className={styles.input}
            placeholder="Решение (приговор) суда"
          />
        </Form.Item>
        <Form.Item
          name="convictedCount"
          label="Осуждено, чел."
          rules={[{ required: true, message: "Осуждено, чел." }]}
        >
          <Input
            className={styles.input}
            placeholder="Осуждено, чел."
            type="number"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
