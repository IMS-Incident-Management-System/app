import { EventType } from "../../../../interfaces/requests/eventType";
import { ObjectAttributes } from "../../../../interfaces/requests/object";

export interface EventFormProps {
  name: number;
  eventTypes: EventType | undefined;
  isEventTypesLoading: boolean;
  objects: ObjectAttributes[];
  isObjectsLoading: boolean;
}
