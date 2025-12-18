
export interface EventTypeTree {
  event_type_id: number;
  key: string;
  value: string;
  title: string;
  children: EventTypeTree[];
}

export interface EventType {
  treeData: EventTypeTree[];
}