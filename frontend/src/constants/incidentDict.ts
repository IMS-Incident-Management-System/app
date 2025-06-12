import { SecurityDirectionEnum } from "../enums/direction";
import { EIncidentStatus } from "../enums/incident";

export const directionDict = {
  [SecurityDirectionEnum.INFORMATION]: "ИБ",
  [SecurityDirectionEnum.ECONOMIC]: "ЭБ",
  [SecurityDirectionEnum.SECURITY]: "БПиО",
};

export const statusDict = {
  [EIncidentStatus.DRAFT]: "Черновик",
  [EIncidentStatus.IN_PROGRESS]: "В работе",
  [EIncidentStatus.COMPLETED]: "Завершен",
  [EIncidentStatus.ARCHIVED]: "В архиве",
};