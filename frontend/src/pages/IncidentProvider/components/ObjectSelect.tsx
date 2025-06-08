import { Select, Form, Input } from "antd";
import styles from "../incidentProvider.module.scss";

interface Option {
  value: string;
  label: string;
}

interface ObjectSelectProps {
  value?: string | null;
  onChange?: (value: string) => void;
}

const objectOptions: Option[] = [
  { value: "BS", label: "БС" },
  { value: "MTSOffice", label: "Офис МТС" },
  { value: "CategorizedPremise", label: "Категорированное помещение" },
  { value: "OtherProperty", label: "Иное имущество" },
  { value: "Personnel", label: "Персонал" },
];

const bsAddressOptions: Option[] = [
  { value: "adres_1", label: "адрес 1" },
  { value: "adres_2", label: "адрес 2" },
  { value: "adres_3", label: "адрес 3" },
  { value: "adres_20", label: "адрес 20" },
  { value: "adres_23", label: "адрес 23" },
  { value: "adres_24", label: "адрес 24" },
  { value: "adres_2222222222222225", label: "адрес 2222222222222225" },
  { value: "adres_26", label: "адрес 26" },
  { value: "adres_27", label: "адрес 27" },
];

const officeAddressOptions: Option[] = [
  { value: "adres_4", label: "адрес 4" },
  { value: "adres_5", label: "адрес 5" },
  { value: "adres_6", label: "адрес 6" },
];

const premiseAddressOptions: Option[] = [
  { value: "adres_7", label: "адрес 7" },
  { value: "adres_8", label: "адрес 8" },
  { value: "adres_9", label: "адрес 9" },
];

// Исправленная функция фильтрации
const filterOption = (
  input: string,
  option?: { children?: string; value: string },
) => {
  const label = option?.children ?? "";
  console.log("Filter input:", input, "Option:", {
    value: option?.value,
    label,
  }); // Для отладки
  return label.toLowerCase().includes(input.toLowerCase());
};

export const ObjectSelect = ({ value, onChange }: ObjectSelectProps) => {
  return (
    <>
      <Form.Item
        className={styles.formItem}
        name="object"
        label="Объекты"
        rules={[{ required: true, message: "Объекты" }]}
      >
        <Select
          className={styles.select}
          placeholder="Объекты"
          value={value ?? undefined}
          onChange={onChange}
        >
          {objectOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {value === "BS" && (
        <>
          <Form.Item
            className={styles.formItem}
            name="bsNumber"
            label="Номер БС"
            rules={[{ required: true, message: "Номер БС" }]}
          >
            <Input className={styles.input} placeholder="Номер БС" />
          </Form.Item>
          <Form.Item
            className={styles.formItem}
            name="bsAddress"
            label="Адрес БС"
            rules={[{ required: true, message: "Адрес БС" }]}
          >
            <Select
              className={styles.select}
              placeholder="Адрес БС"
              showSearch
              filterOption={filterOption}
              dropdownStyle={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {bsAddressOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}

      {value === "MTSOffice" && (
        <>
          <Form.Item
            className={styles.formItem}
            name="officeNumber"
            label="Номер офиса"
            rules={[{ required: true, message: "Номер офиса" }]}
          >
            <Input className={styles.input} placeholder="Номер офиса" />
          </Form.Item>
          <Form.Item
            className={styles.formItem}
            name="officeAddress"
            label="Адрес офиса"
            rules={[{ required: true, message: "Адрес офиса" }]}
          >
            <Select
              className={styles.select}
              placeholder="Адрес офиса"
              showSearch
              filterOption={filterOption}
              dropdownStyle={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {officeAddressOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}

      {value === "CategorizedPremise" && (
        <Form.Item
          className={styles.formItem}
          name="promiseAddress"
          label="Адрес помещения"
          rules={[{ required: true, message: "Адрес помещения" }]}
        >
          <Select
            className={styles.select}
            placeholder="Адрес помещения"
            showSearch
            filterOption={filterOption}
            dropdownStyle={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {premiseAddressOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

      {value === "Personnel" && (
        <>
          <Form.Item
            className={styles.formItem}
            name="personnelFullName"
            label="ФИО"
            rules={[{ required: true, message: "ФИО" }]}
          >
            <Input className={styles.input} placeholder="ФИО" />
          </Form.Item>
          <Form.Item
            className={styles.formItem}
            name="personnelPosition"
            label="Должность"
            rules={[{ required: true, message: "Должность" }]}
          >
            <Input className={styles.input} placeholder="Должность" />
          </Form.Item>
          <Form.Item
            className={styles.formItem}
            name="personnelId"
            label="Табельный номер"
            rules={[{ required: true, message: "Табельный номер" }]}
          >
            <Input className={styles.input} placeholder="Табельный номер" />
          </Form.Item>
        </>
      )}
    </>
  );
};
