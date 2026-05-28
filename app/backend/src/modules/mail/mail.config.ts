export interface MailConfig {
  enabled: boolean;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  from: {
    name: string;
    address: string;
  };
  isDbRecipients: string[];
  publicAppUrl: string;
}

function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined || value === '') return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
}

function parseRecipients(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

function normalizeSmtpUser(user: string): string {
  return user.trim().toLowerCase();
}

/** Пароль приложения Yandex иногда копируют с пробелами — убираем их. */
function normalizeSmtpPassword(password: string): string {
  return password.trim().replace(/\s+/g, '');
}

export function getMailConfig(): MailConfig {
  const port = Number(process.env.MAIL_SMTP_PORT ?? 465);
  const user = normalizeSmtpUser(process.env.MAIL_SMTP_USER ?? '');
  const password = normalizeSmtpPassword(process.env.MAIL_SMTP_PASSWORD ?? '');
  const resolvedPort = Number.isFinite(port) ? port : 465;
  const secureFromEnv = process.env.MAIL_SMTP_SECURE;
  const secure =
    secureFromEnv !== undefined && secureFromEnv !== ''
      ? parseBoolean(secureFromEnv, true)
      : resolvedPort === 465;

  const fromAddress = process.env.MAIL_FROM_ADDRESS?.trim().toLowerCase() || user;

  return {
    enabled: parseBoolean(process.env.MAIL_ENABLED, false),
    smtp: {
      host: process.env.MAIL_SMTP_HOST?.trim() || 'smtp.yandex.ru',
      port: resolvedPort,
      secure,
      user,
      password,
    },
    from: {
      name: process.env.MAIL_FROM_NAME?.trim() || 'IMS',
      address: fromAddress,
    },
    isDbRecipients: parseRecipients(process.env.MAIL_IS_DB_RECIPIENTS),
    publicAppUrl: (
      process.env.APP_PUBLIC_URL?.trim() ||
      process.env.FRONTEND_PUBLIC_URL?.trim() ||
      `http://localhost:8026`
    ).replace(/\/$/, ''),
  };
}

export function isMailTransportConfigured(config: MailConfig = getMailConfig()): boolean {
  return Boolean(config.smtp.user && config.smtp.password && config.from.address);
}

export function isIsDbNotificationConfigured(config: MailConfig = getMailConfig()): boolean {
  return config.enabled && isMailTransportConfigured(config) && config.isDbRecipients.length > 0;
}
