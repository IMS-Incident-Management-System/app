import { Form, Input, DatePicker, InputNumber, Card, Row, Col, Divider } from "antd";
import styles from "./EventCriminalCase.module.scss";
import { CreateEventBody } from "../../../../interfaces/requests/event";

const { TextArea } = Input;

export const EventCriminalCase = () => {
  return (
    <Card className={styles.sectionCard} title="Уголовные / административные дела">
      <div className={styles.criminalSection}>
        <Divider orientation="left" plain>
          Передача материалов
        </Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Дата передачи в ПРоО"
              name={["criminal_case", "transfer_date"]}
              tooltip="Дата передачи материалов в правоохранительные органы"
            >
              <DatePicker 
                style={{ width: "100%" }} 
                placeholder="Выберите дату" 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Номер документа/КУСП"
              name={["criminal_case", "document_number"]}
              tooltip="Номер вх./исх. документа или Номер КУСП"
            >
              <Input placeholder="Введите номер" className={styles.formInput} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Подразделение"
              name={["criminal_case", "department_name"]}
              tooltip="Наименование подразделения, куда переданы материалы"
            >
              <Input placeholder="Название подразделения" className={styles.formInput} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div className={styles.criminalSection}>
        <Divider orientation="left" plain>Рассмотрение материалов</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item<CreateEventBody>
              label="Результат рассмотрения"
              name={["criminal_case", "review_result"]}
            >
              <TextArea rows={2} placeholder="Опишите результат" className={styles.textArea} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item<CreateEventBody>
              label="Причина отказа"
              name={["criminal_case", "rejection_reason"]}
              tooltip="Причина отказа в возбуждении УД/АД"
            >
              <TextArea rows={2} placeholder="Укажите причину отказа" className={styles.textArea} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Дата отказа"
              name={["criminal_case", "rejection_date"]}
              tooltip="Дата отказа в возбуждении УД/АД"
            >
              <DatePicker 
                style={{ width: "100%" }} 
                placeholder="Выберите дату" 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Дата обжалования"
              name={["criminal_case", "appeal_date"]}
              tooltip="Дата обжалования отказа"
            >
              <DatePicker 
                style={{ width: "100%" }} 
                placeholder="Выберите дату" 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div className={styles.criminalSection}>
        <Divider orientation="left" plain>Возбуждение дела</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Дата возбуждения"
              name={["criminal_case", "case_date"]}
              tooltip="Дата возбуждения УД/АД"
            >
              <DatePicker 
                style={{ width: "100%" }} 
                placeholder="Выберите дату" 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Номер дела"
              name={["criminal_case", "case_number"]}
              tooltip="Номер УД/АД"
            >
              <Input placeholder="Введите номер" className={styles.formInput} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Статья"
              name={["criminal_case", "law_article"]}
              tooltip="Статья УКРФ/КоАПРФ"
            >
              <Input placeholder="Номер статьи" className={styles.formInput} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Инициатор"
              name={["criminal_case", "initiator"]}
              tooltip="Инициатор возбуждения УД/АД"
            >
              <Input placeholder="ФИО инициатора" className={styles.formInput} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Задержано"
              name={["criminal_case", "detained_count"]}
              tooltip="Задержано, человек"
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                placeholder="0" 
                addonAfter="чел." 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} lg={8}>
            <Form.Item<CreateEventBody>
              label="Субъект преступления"
              name={["criminal_case", "subject"]}
              tooltip="Субъект преступления УД/АД"
            >
              <Input placeholder="Описание субъекта" className={styles.formInput} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div className={styles.criminalSection}>
        <Divider orientation="left" plain>Привлекаемое лицо</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item<CreateEventBody>
              label="ФИО / Название организации"
              name={["criminal_case", "person_name"]}
              tooltip="ФИО лица или название юридического лица, привлекаемого к уголовной/административной ответственности"
            >
              <Input placeholder="Введите ФИО или название организации" className={styles.formInput} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div className={styles.criminalSection}>
        <Divider orientation="left" plain>Результаты</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item<CreateEventBody>
              label="Результат рассмотрения"
              name={["criminal_case", "case_result"]}
              tooltip="Результат рассмотрения УД/АД"
            >
              <TextArea rows={2} placeholder="Опишите результат рассмотрения" className={styles.textArea} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item<CreateEventBody>
              label="Решение суда"
              name={["criminal_case", "court_decision"]}
              tooltip="Решение (приговор) суда"
            >
              <TextArea rows={2} placeholder="Опишите решение или приговор" className={styles.textArea} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              label="Осуждено"
              name={["criminal_case", "convicted_count"]}
              tooltip="Осуждено, человек"
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                placeholder="0" 
                addonAfter="чел." 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

