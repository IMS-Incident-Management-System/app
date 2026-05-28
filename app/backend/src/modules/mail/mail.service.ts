import { getMailConfig, isMailTransportConfigured } from './mail.config';
import { getMailTransporter } from './mail.transport';
import { MailMessage, MailSendResult } from './mail.types';

function logYandexAuthHint(error: unknown): void {
  const err = error as { code?: string; responseCode?: number };
  if (err?.code !== 'EAUTH' && err?.responseCode !== 535) return;

  console.error(
    `[mail] Yandex SMTP 535 — проверьте настройки ящика ${getMailConfig().smtp.user}:\n` +
      '  1. Яндекс ID → Безопасность → Пароли приложений → создать пароль для «Почта»\n' +
      '  2. MAIL_SMTP_PASSWORD = этот пароль (не основной пароль от аккаунта)\n' +
      '  3. Почта → Настройки → Почтовые программы → разрешить доступ с IMAP/SMTP\n' +
      '  4. MAIL_FROM_ADDRESS должен совпадать с MAIL_SMTP_USER\n' +
      '  5. Если 465 не работает: MAIL_SMTP_PORT=587 и MAIL_SMTP_SECURE=false'
  );
}

function normalizeRecipients(to: string | string[]): string[] {
  const list = Array.isArray(to) ? to : [to];
  return [...new Set(list.map((email) => email.trim()).filter(Boolean))];
}

export const mailService = {
  async send(message: MailMessage): Promise<MailSendResult | null> {
    const config = getMailConfig();
    if (!config.enabled) {
      console.info('[mail] Skipped: MAIL_ENABLED is false');
      return null;
    }

    if (!isMailTransportConfigured(config)) {
      console.warn('[mail] Skipped: SMTP is not configured');
      return null;
    }

    const recipients = normalizeRecipients(message.to);
    if (!recipients.length) {
      console.warn('[mail] Skipped: no recipients');
      return null;
    }

    const transport = getMailTransporter(config);
    if (!transport) {
      console.warn('[mail] Skipped: transporter is unavailable');
      return null;
    }

    try {
      const result = await transport.sendMail({
        from: `"${config.from.name}" <${config.from.address}>`,
        to: recipients,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });

      return {
        messageId: result.messageId,
        accepted: (result.accepted ?? []).map(String),
        rejected: (result.rejected ?? []).map(String),
      };
    } catch (error) {
      logYandexAuthHint(error);
      throw error;
    }
  },
};
