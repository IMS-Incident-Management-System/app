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

## Поведение

При создании **инцидента** или **события** с галочкой «Особо важно (1ДБ)» отправляется письмо:

- тема: `IMS: Создан инцидент с пометкой 1-ДБ` / `IMS: Создано событие с пометкой 1-ДБ`;
- ID карточки (код или `#id`);
- ссылка на просмотр: `{APP_PUBLIC_URL}/incidents/view/{id}` или `/events/view/{id}`.

Ошибка отправки **не отменяет** создание карточки — пишется в лог сервера.

Если `MAIL_ENABLED=false` или не заданы SMTP/получатели — отправка пропускается без ошибки.
