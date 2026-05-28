import { IsDbEntityCreatedNotificationInput, MailEntityType, MailMessage } from '../mail.types';

const ENTITY_META: Record<
  MailEntityType,
  { label: string; labelAcc: string; subject: string }
> = {
  incident: {
    label: 'инцидент',
    labelAcc: 'инцидент',
    subject: 'Создан инцидент с пометкой 1-ДБ',
  },
  event: {
    label: 'событие',
    labelAcc: 'событие',
    subject: 'Создано событие с пометкой 1-ДБ',
  },
};

function buildViewPath(entityType: MailEntityType, entityId: number): string {
  return entityType === 'incident' ? `/incidents/view/${entityId}` : `/events/view/${entityId}`;
}

export function buildEntityPublicUrl(
  publicAppUrl: string,
  entityType: MailEntityType,
  entityId: number
): string {
  return `${publicAppUrl}${buildViewPath(entityType, entityId)}`;
}

export function buildIsDbEntityCreatedMail(
  input: IsDbEntityCreatedNotificationInput,
  publicAppUrl: string
): Pick<MailMessage, 'subject' | 'text' | 'html'> {
  const meta = ENTITY_META[input.entityType];
  const displayId = input.entityCode?.trim() || `#${input.entityId}`;
  const url = buildEntityPublicUrl(publicAppUrl, input.entityType, input.entityId);

  const subject = `IMS: ${meta.subject}`;
  const text = [
    `${meta.subject}.`,
    '',
    `Тип: ${meta.labelAcc}`,
    `ID: ${displayId}`,
    `Ссылка: ${url}`,
    '',
    '—',
    'Уведомление отправлено автоматически системой IMS.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #262626; line-height: 1.5;">
      <p><strong>${meta.subject}</strong></p>
      <p>Тип: ${meta.labelAcc}<br/>
      ID: <strong>${displayId}</strong></p>
      <p><a href="${url}">Открыть карточку в IMS</a></p>
      <p style="color: #8c8c8c; font-size: 12px;">Уведомление отправлено автоматически системой IMS.</p>
    </div>
  `.trim();

  return { subject, text, html };
}
