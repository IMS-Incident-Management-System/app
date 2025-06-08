import { Select, Form } from "antd";
import styles from "../incidentProvider.module.scss";

interface Option {
  value: string;
  label: string;
}

interface FoSubregionOptions {
  [key: string]: Option[];
}

interface FoSubRegionSelectProps {
  visible: boolean;
  region: string | null;
  value?: string | null;
  onChange?: (value: string) => void;
}

const foSubregionOptions: FoSubregionOptions = {
  Center: [
    { value: "Belgorod", label: "Белгородская область" },
    { value: "Bryansk", label: "Брянская область" },
    { value: "Vladimir", label: "Владимирская область" },
    { value: "Voronezh", label: "Воронежская область" },
    { value: "Ivanovo", label: "Ивановская область" },
    { value: "Kaluga", label: "Калужская область" },
    { value: "Kostroma", label: "Костромская область" },
    { value: "Kursk", label: "Курская область" },
    { value: "Lipetsk", label: "Липецкая область" },
    { value: "Orel", label: "Орловская область" },
    { value: "Ryazan", label: "Рязанская область" },
    { value: "Smolensk", label: "Смоленская область" },
    { value: "Tambov", label: "Тамбовская область" },
    { value: "Tver", label: "Тверская область" },
    { value: "Tula", label: "Тульская область" },
    { value: "Yaroslavl", label: "Ярославская область" },
  ],
  NorthWest: [
    { value: "SaintPetersburg", label: "Санкт-Петербург" },
    { value: "Vologda", label: "Вологодская область" },
    { value: "Kaliningrad", label: "Калининградская область" },
    { value: "Murmansk", label: "Мурманская область" },
    { value: "Novgorod", label: "Новгородская область" },
    { value: "Pskov", label: "Псковская область" },
    { value: "Karelia", label: "Республика Карелия" },
    { value: "Komi", label: "Республика Коми" },
    { value: "Arkhangelsk", label: "Архангельская область" },
  ],
  Volga: [
    { value: "Kirov", label: "Кировская область" },
    { value: "Orenburg", label: "Оренбургская область" },
    { value: "Samara", label: "Самарская область" },
    { value: "Saratov", label: "Саратовская область" },
    { value: "NizhnyNovgorod", label: "Нижегородская область" },
    { value: "Penza", label: "Пензенская область" },
    { value: "Perm", label: "Пермский край" },
    { value: "Bashkortostan", label: "Республика Башкортостан" },
    { value: "MariyEl", label: "Республика Марий Эл" },
    { value: "Mordovia", label: "Республика Мордовия" },
    { value: "Tatarstan", label: "Республика Татарстан" },
    { value: "Udmurt", label: "Удмуртская Республика" },
    { value: "Ulyanovsk", label: "Ульяновская область" },
    { value: "Chuvash", label: "Чувашская Республика" },
  ],
  South: [
    { value: "Krasnodar", label: "Краснодар" },
    { value: "Sochi", label: "Сочи" },
    { value: "Novorossiysk", label: "Новороссийск" },
    { value: "Rostov", label: "Ростов" },
    { value: "Stavropol", label: "Ставрополь" },
    { value: "Volgograd", label: "Волгоград" },
    { value: "Astrakhan", label: "Астрахань" },
    { value: "Alania", label: "Алания" },
    { value: "Ingushetia", label: "Ингушетия" },
    { value: "KBR", label: "КБР" },
    { value: "KCHR", label: "КЧР" },
    { value: "Dagestan", label: "Дагестан" },
    { value: "Chechnya", label: "Чечня" },
  ],
  Ural: [
    { value: "Sverdlovsk", label: "Свердловская область" },
    { value: "KhMAOYugra", label: "ХМАО-Югра" },
    { value: "Chelyabinsk", label: "Челябинская область" },
    { value: "Tyumen", label: "Тюменская область" },
    { value: "Kurgan", label: "Курган" },
    { value: "YANAO", label: "ЯНАО" },
  ],
  Siberia: [
    { value: "Novosibirsk", label: "Новосибирская область" },
    { value: "Omsk", label: "Омская область" },
    { value: "Tomsk", label: "Томская область" },
    { value: "AltaiKrai", label: "Алтайский край" },
    { value: "AltaiRepublic", label: "Республика Алтай" },
    { value: "Krasnoyarsk", label: "Красноярский край" },
    { value: "Kemerovo", label: "Кемеровская область" },
    { value: "Khakasia", label: "Республика Хакасия" },
    { value: "Tuva", label: "Республика Тыва" },
    { value: "Irkutsk", label: "Иркутская область" },
  ],
  FarEast: [
    { value: "Khabarovsk", label: "Хабаровский край" },
    { value: "Primorsky", label: "Приморский край" },
    { value: "Amur", label: "Амурская область" },
    { value: "Magadan", label: "Магаданская область" },
    { value: "Sakha", label: "Республика Саха (Якутия)" },
    { value: "Kamchatka", label: "Камчатский край" },
    { value: "Sakhalin", label: "Сахалинская область" },
    { value: "Zabaikalsky", label: "Забайкальский край" },
    { value: "Buryatia", label: "Республика Бурятия" },
  ],
};

export const FoSubRegionSelect = ({
  visible,
  region,
  value,
  onChange,
}: FoSubRegionSelectProps) => {
  if (!visible || !region) return null;

  return (
    <Form.Item
      className={styles.formItem}
      name="subRegion"
      label="Выбор субрегиона"
      rules={[{ required: true, message: "Выберите субрегион" }]}
    >
      <Select
        className={styles.select}
        placeholder="Выберите субрегион"
        value={value ?? undefined}
        onChange={onChange}
      >
        {foSubregionOptions[region]?.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};
