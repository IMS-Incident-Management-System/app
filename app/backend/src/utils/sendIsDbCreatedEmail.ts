import { notifyIsDbEntityCreated, MailEntityType } from '../modules/mail';

/**
 * Fire-and-forget уведомление о создании карточки с пометкой 1-ДБ.
 * Ошибка отправки не влияет на ответ API.
 */
export function sendIsDbCreatedEmailAsync(params: {
  entityType: MailEntityType;
  entityId: number;
  entityCode?: string | null;
}): void {
  void notifyIsDbEntityCreated(params).catch((error) => {
    console.error('[mail] Failed to send 1-ДБ notification:', error);
  });
}
