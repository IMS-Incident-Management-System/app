import { EventType } from "../../../../interfaces/requests/eventType";

export interface EventFormProps {
  name: number;
  eventTypes: EventType | undefined;
  isEventTypesLoading: boolean;
}
