import { IncidentEventType } from "../../../../interfaces/requests/incidentEventType";

export interface EventFormProps {
  name: string | number;
  eventTypes: IncidentEventType | undefined;
  isEventTypesLoading: boolean;
}
