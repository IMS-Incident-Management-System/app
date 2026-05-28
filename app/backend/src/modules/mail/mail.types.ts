export type MailEntityType = 'incident' | 'event';

export interface MailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}

export interface IsDbEntityCreatedNotificationInput {
  entityType: MailEntityType;
  entityId: number;
  entityCode?: string | null;
}

export interface MailSendResult {
  messageId?: string;
  accepted: string[];
  rejected: string[];
}
