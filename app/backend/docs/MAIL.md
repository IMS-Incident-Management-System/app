# Почтовые уведомления (Yandex SMTP)

Модуль: `src/modules/mail/`

## Переменные окружения

```env
MAIL_ENABLED=true
MAIL_SMTP_HOST=smtp.yandex.ru
MAIL_SMTP_PORT=465
MAIL_SMTP_SECURE=true
MAIL_SMTP_USER=your-login@yandex.ru
MAIL_SMTP_PASSWORD=app-password-from-yandex
MAIL_FROM_NAME=IMS
MAIL_FROM_ADDRESS=your-login@yandex.ru
MAIL_IS_DB_RECIPIENTS=security@company.ru,another@company.ru
APP_PUBLIC_URL=http://localhost:8026
```

Для Yandex используйте [пароль приложения](https://yandex.ru/support/id/authorization/app-passwords.html), **не** основной пароль аккаунта.

### Ошибка `535 … does not have access rights to this service`

1. [Пароли приложений](https://id.yandex.ru/security/app-passwords) → создать → тип **Почта** → вставить в `MAIL_SMTP_PASSWORD`.
2. [Настройки почты](https://mail.yandex.ru/?nc#setup/client) → включить доступ для почтовых программ (IMAP/SMTP).
3. `MAIL_SMTP_USER` и `MAIL_FROM_ADDRESS` — один и тот же полный адрес (`user@yandex.ru`).
4. При 465 + SSL ошибке попробуйте:
   ```env
   MAIL_SMTP_PORT=587
   MAIL_SMTP_SECURE=false
   ```

### Корпоративный SMTP (например `smtp.inside.mts.ru`)

Внутренние серверы часто отдают самоподписанный или корпоративный сертификат, которого нет в trust store контейнера Node.js. Ошибка в логе: `self signed certificate` / `DEPTH_ZERO_SELF_SIGNED_CERT`.

```env
MAIL_SMTP_HOST=smtp.inside.mts.ru
MAIL_SMTP_PORT=587
MAIL_SMTP_SECURE=false
MAIL_SMTP_TLS_REJECT_UNAUTHORIZED=false
```

Порт и `MAIL_SMTP_SECURE` уточните у админов почты (часто 587 + STARTTLS или 465 + SSL).  
`MAIL_SMTP_TLS_REJECT_UNAUTHORIZED=false` отключает проверку цепочки сертификата — используйте только для доверенных внутренних SMTP внутри сети. Более безопасный вариант — добавить корпоративный CA в образ Docker.

## Поведение

При создании **инцидента** или **события** с галочкой «Особо важно (1ДБ)» отправляется письмо:

- тема: `IMS: Создан инцидент с пометкой 1-ДБ` / `IMS: Создано событие с пометкой 1-ДБ`;
- ID карточки (код или `#id`);
- ссылка на просмотр: `{APP_PUBLIC_URL}/incidents/view/{id}` или `/events/view/{id}`.

Ошибка отправки **не отменяет** создание карточки — пишется в лог сервера.

Если `MAIL_ENABLED=false` или не заданы SMTP/получатели — отправка пропускается без ошибки.
