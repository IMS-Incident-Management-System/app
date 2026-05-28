import nodemailer, { Transporter } from 'nodemailer';
import { getMailConfig, isMailTransportConfigured, MailConfig } from './mail.config';

let transporter: Transporter | null = null;
let transporterConfigKey: string | null = null;

function buildConfigKey(config: MailConfig): string {
  return `${config.smtp.host}:${config.smtp.port}:${config.smtp.user}:${config.smtp.secure}`;
}

export function getMailTransporter(config: MailConfig = getMailConfig()): Transporter | null {
  if (!isMailTransportConfigured(config)) {
    return null;
  }

  const configKey = buildConfigKey(config);
  if (transporter && transporterConfigKey === configKey) {
    return transporter;
  }

  const { port, secure } = config.smtp;

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
    tls: {
      minVersion: 'TLSv1.2',
      servername: config.smtp.host,
    },
  });

  transporterConfigKey = configKey;
  return transporter;
}

export async function verifyMailTransport(config: MailConfig = getMailConfig()): Promise<boolean> {
  const transport = getMailTransporter(config);
  if (!transport) return false;
  await transport.verify();
  return true;
}
