# Инструкция по настройке Keycloak для IMS

## Обзор

IMS использует Keycloak для аутентификации и авторизации. Требуется создать **один клиент** для фронтенд приложения.

## Требования

- Realm: `ims`
- Клиент для фронтенда: `ims_client` (Public client)

## Пошаговая настройка

### 1. Создание Realm

1. Войдите в Keycloak Admin Console (обычно `http://localhost:8087` или ваша конфигурация)
2. Нажмите на выпадающий список в левом верхнем углу (там, где написано "master")
3. Нажмите **"Create Realm"** или **"Создать Realm"**
4. Введите имя realm: `ims`
5. Включите переключатель **"Enabled"**
6. Нажмите **"Create"**

### 2. Создание клиента для Frontend (`ims_client`)

1. В созданном realm `ims` перейдите в **"Clients"** (Клиенты) в левом меню
2. Нажмите **"Create client"** (Создать клиента)
3. На вкладке **"General Settings"**:
   - **Client type**: `OpenID Connect`
   - **Client ID**: `ims_client`
   - Нажмите **"Next"**

4. На вкладке **"Capability config"**:
   - ✅ **Client authentication**: `OFF` (Public client - так как это фронтенд приложение)
   - ✅ **Authorization**: `OFF` (если не используется fine-grained authorization)
   - ✅ **Standard flow**: `ON` (Authorization Code Flow)
   - ✅ **Direct access grants**: `ON` (если нужна поддержка Resource Owner Password Credentials)
   - ✅ **Implicit flow**: `OFF` (устаревший)
   - Нажмите **"Next"**

5. На вкладке **"Login settings"**:
   - **Root URL**: оставьте пустым или укажите базовый URL вашего приложения
   - **Home URL**: оставьте пустым или укажите URL домашней страницы
   - **Valid redirect URIs**: добавьте все URL, на которые можно перенаправить после логина:
     ```
     http://localhost:3000/*
     http://localhost:80/*
     https://ims-mts.ru/*
     https://www.ims-mts.ru/*
     ```
     (Используйте `*` для подстановки или укажите конкретные пути)
   - **Valid post logout redirect URIs**: добавьте те же URL для выхода:
     ```
     http://localhost:3000/*
     http://localhost:80/*
     https://ims-mts.ru/*
     https://www.ims-mts.ru/*
     ```
   - **Web origins**: добавьте разрешенные источники для CORS (используйте `+` для разрешения всех редиректов или укажите конкретные):
     ```
     http://localhost:3000
     http://localhost:80
     https://ims-mts.ru
     https://www.ims-mts.ru
     ```
   - Нажмите **"Next"**

6. Просмотрите настройки и нажмите **"Save"**

### 3. Настройка Access Token (опционально, но рекомендуется)

1. В настройках клиента `ims_client` перейдите на вкладку **"Advanced settings"**
2. Настройте токены:
   - **Access Token Lifespan**: `5 Minutes` (или другое значение по необходимости)
   - **Access token expiration**: `5 Minutes`
   - **SSO Session Idle**: `30 Minutes`
   - **SSO Session Max**: `10 Hours`

### 4. Создание пользователей для тестирования

1. Перейдите в **"Users"** (Пользователи) в левом меню
2. Нажмите **"Create new user"** (Создать нового пользователя)
3. Заполните обязательные поля:
   - **Username**: например, `testuser`
   - **Email**: укажите email
   - ✅ **Email verified**: включите для тестирования
   - ✅ **Enabled**: включите
   - Нажмите **"Create"**

4. Установите пароль:
   - Перейдите на вкладку **"Credentials"**
   - Нажмите **"Set password"**
   - Введите пароль
   - ✅ **Temporary**: снимите галочку (чтобы не требовалась смена пароля при первом входе)
   - Нажмите **"Save"**

### 5. Настройка переменных окружения

Убедитесь, что в ваших `.env` файлах указаны правильные значения:

**Frontend (.env или .env-files/.env-generator.env):**
```env
REACT_APP_BASE_URL_KEYCLOAK=http://localhost:8087
# или для production:
baseURLKeycloakFE=https://ims-mts.ru/auth
```

**Backend (.env):**
```env
KEYCLOAK_URL=http://localhost:8087
# или для production:
KEYCLOAK_URL=https://ims-mts.ru/auth

KEYCLOAK_URL_ISSUER=http://localhost:8087
# или для production:
KEYCLOAK_URL_ISSUER=https://ims-mts.ru/auth

KEYCLOAK_REALM=ims
KEYCLOAK_CLIENT_ID_FE=ims_client
KEYCLOAK_CLIENT_SECRET=  # Не требуется для public client
```

## Проверка конфигурации

### Проверка клиента через Keycloak Admin Console

1. Перейдите в **Clients** → `ims_client`
2. Перейдите на вкладку **"Client scopes"** → **"Evaluate"**
3. Введите тестовый username и нажмите **"Evaluate"**
4. Проверьте, что токены генерируются корректно

### Проверка через приложение

1. Запустите frontend приложение
2. Откройте в браузере (должно перенаправить на Keycloak для логина)
3. Войдите с созданным пользователем
4. Проверьте, что токен получен и API запросы работают

## Дополнительные настройки (опционально)

### Настройка ролей (Roles)

Если требуется разграничение доступа по ролям:

1. Перейдите в **"Realm roles"** или **"Client roles"**
2. Создайте необходимые роли (например: `admin`, `user`, `viewer`)
3. Назначьте роли пользователям через вкладку **"Role mappings"** в настройках пользователя

### Настройка групп (Groups)

Для организации пользователей:

1. Перейдите в **"Groups"**
2. Создайте группы
3. Добавьте пользователей в группы
4. Назначьте роли группам

### Настройка Realm settings

1. Перейдите в **"Realm settings"**
2. На вкладке **"General"**:
   - Установите **Display name**: `IMS`
   - Установите **HTML Display name**: `IMS`
3. На вкладке **"Security defenses"**:
   - Настройте защиту от брутфорса (Brute Force Detection)
4. На вкладке **"Tokens"**:
   - Настройте время жизни токенов для realm

## Важные замечания

1. **Public Client**: `ims_client` настроен как public client (без секрета), так как это фронтенд приложение, код которого доступен пользователям.

2. **Valid Redirect URIs**: Убедитесь, что все возможные URL для редиректов добавлены, иначе Keycloak будет отклонять запросы.

3. **Web Origins**: Настройте правильно для избежания CORS ошибок.

4. **Token Audience**: Backend проверяет, что токен имеет audience `ims_client`. Это происходит автоматически при использовании `ims_client` для аутентификации.

5. **Token Verification**: Backend использует JWKS для проверки подписи токенов. Убедитесь, что URL для получения публичных ключей доступен:
   ```
   ${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs
   ```

## Troubleshooting

### Ошибка "Invalid redirect URI"
- Проверьте, что URL редиректа в запросе точно совпадает с одним из значений в "Valid redirect URIs"
- Убедитесь, что используется правильный протокол (http/https)

### Ошибка "Invalid client"
- Проверьте, что Client ID точно соответствует `ims_client`
- Убедитесь, что клиент включен (Enabled = ON)

### Ошибка "CORS policy"
- Проверьте настройки "Web origins" в клиенте
- Проверьте настройки CORS в backend (если используется)

### Токен не проходит валидацию на backend
- Проверьте, что `KEYCLOAK_REALM=ims`
- Проверьте, что `KEYCLOAK_CLIENT_ID_FE=ims_client`
- Убедитесь, что JWKS endpoint доступен: `${KEYCLOAK_URL}/realms/ims/protocol/openid-connect/certs`

