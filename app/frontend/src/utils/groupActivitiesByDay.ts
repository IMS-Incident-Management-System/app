import dayjs from 'dayjs';
import { ActivityItem } from '../interfaces/activity';

export interface ActivityDayGroup {
  label: string;
  items: ActivityItem[];
}

export function getDayLabel(dateIso: string): string {
  const d = dayjs(dateIso);
  const today = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');
  if (d.isSame(today, 'day')) return 'Сегодня';
  if (d.isSame(yesterday, 'day')) return 'Вчера';
  return d.format('DD.MM.YYYY');
}

export function groupActivitiesByDay(activities: ActivityItem[]): ActivityDayGroup[] {
  const map = new Map<string, ActivityItem[]>();
  for (const item of activities) {
    const label = getDayLabel(item.occurred_at);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}
