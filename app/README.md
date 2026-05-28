# IMS-MTS

Единый репозиторий для локальной разработки и деплоя в prod (MTS).

## Окружения

| | Локально | Prod (MTS) |
|--|----------|------------|
| Команда | `make dev` | `make prod` |
| Env | `.env.development` | `.env.production` (из example) |
| npm (backend/frontend build) | публичный registry.npmjs.org | `NPM_REGISTRY` → Nexus (`nexus-cache.services.mts.ru`) |
| Keycloak | `quay.io`, `start-dev` | `quay.services.mts.ru`, `/auth` за nginx |
| Frontend | `localhost:8087` | `0000pamkiiavdb.msk.mts.ru` |

## Быстрый старт (dev)

```bash
cd app
make dev
```

Создаёт `.env` и `frontend/.env` из development-шаблонов и поднимает compose.

## Деплой (prod)

```bash
cd app
cp .env.production.example .env.production
# отредактировать секреты в .env.production
make prod
```

`make prod` также собирает frontend в `frontend/dist` с `frontend/.env.production`.

Prod-only override: `docker-compose.prod.yaml` (extra_hosts для резолва APP_DOMAIN).

На сервере с `docker-compose` 1.29 и новым Docker при `KeyError: ContainerConfig` — `make prod` делает `down` + `up`. Лучше поставить плагин v2: `sudo apt install docker-compose-plugin`, тогда работает `docker compose`.

## Сертификаты на сервере

```bash
make deploy-certs
```

Или вручную: `./scripts/deploy-cert.sh production`

Корпоративный сертификат можно положить в docker volume `certs` по пути
`/etc/letsencrypt/live/<SSL_CERT_DIR>/` — см. `SSL_CERT_DIR` в `.env.production`.

## Env generator (опционально)

Не входит в `make dev` / `make prod`. Отдельный compose-файл:

```bash
# создать .env-files/.env-generator.env с доступом к Vault
docker compose -f docker-compose.yaml -f docker-compose.env-generator.yaml up ims-env-generator
# или: docker-compose -f docker-compose.yaml -f docker-compose.env-generator.yaml up ims-env-generator
```

восстановление из бэкапа базы:

gunzip -c /var/backups/ims-postgres/ims_YYYYMMDD_HHMMSS.sql.gz \
  | sudo docker exec -i ims-postgres psql -U admin -d ims