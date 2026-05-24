
export interface IncidentEventTypeTree {
  event_type_id: number;
  key: string;
  value: string;
  title: string;
  children: IncidentEventTypeTree[];
}

export interface IncidentEventType {
  treeData: IncidentEventTypeTree[];
}


