import { TheftTypeEnum } from "../../enums/theft";

export interface TheftTypeAttributes {
  id: number;
  type: TheftTypeEnum;
  name: string;
}
