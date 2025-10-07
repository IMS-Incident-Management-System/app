import { EventType } from "../../../../interfaces/requests/eventType";

export interface EventFormProps {
  name: string | number;
  eventTypes: EventType | undefined;
  isEventTypesLoading: boolean;
}
