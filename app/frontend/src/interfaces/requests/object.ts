import { ObjectType } from "../../enums/object";

export interface ObjectAttributes {
  id: number;
  type: ObjectType;
  number?: string;
  address?: string;
  personnel_full_name?: string;
  personnel_position?: string;
  personnel_employee_number?: string;
}
