import { getMailConfig, isIsDbNotificationConfigured } from '../mail.config';
import { mailService } from '../mail.service';
import { buildIsDbEntityCreatedMail } from '../templates/isDbEntityCreated.template';
import { IsDbEntityCreatedNotificationInput } from '../mail.types';

export async function notifyIsDbEntityCreated(
  input: IsDbEntityCreatedNotificationInput
): Promise<void> {
  const config = getMailConfig();

  if (!isIsDbNotificationConfigured(config)) {
    console.info('[mail] 1-ДБ notification skipped: mail is disabled or recipients are not configured');
    return;
  }

  const { subject, text, html } = buildIsDbEntityCreatedMail(input, config.publicAppUrl);

  await mailService.send({
    to: config.isDbRecipients,
    subject,
    text,
    html,
  });

  console.info(
    `[mail] 1-ДБ notification sent for ${input.entityType} ${input.entityCode ?? input.entityId}`
  );
}
