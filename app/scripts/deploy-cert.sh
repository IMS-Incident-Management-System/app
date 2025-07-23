#!/usr/bin/env bash
set -euo pipefail

######################################
# Параметры и пути
######################################

SCRIPTS_DIR="$(dirname "$(readlink -f "$0")")"
PROJECT_DIR="$SCRIPTS_DIR/.."
ENV_FILE="$PROJECT_DIR/.env"

# Скрипт для renew
RENEW_SCRIPT="$SCRIPTS_DIR/certbot-renew.sh"

# Cron-файл
CRON_FILE="/etc/cron.d/certbot-renew"

######################################
# Подготовка
######################################

chmod +x "$SCRIPTS_DIR/deploy-cert.sh" "$RENEW_SCRIPT"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERROR] .env файл не найден в $PROJECT_DIR"
  exit 1
fi
source "$ENV_FILE"

# MODE из первого аргумента, либо из NODE_ENV из .env, либо "production"
MODE="${1:-${NODE_ENV:-production}}"

echo "[INFO] Запуск в режиме: $MODE"

cd "$PROJECT_DIR"

######################################
# Проверка и создание volume’ов
######################################

if docker volume ls -q | grep -wq certs; then
  echo "[INFO] Volume certs уже существует"
else
  echo "[INFO] Создаём volume certs и webroot"
  docker volume create certs
  docker volume create webroot
fi

######################################
# Initial issuance (если нужно и не dev)
######################################

if [[ "$MODE" != "development" ]]; then
  CERTS_MOUNT="$(docker volume inspect certs -f '{{ .Mountpoint }}')"
  if [[ ! -d "$CERTS_MOUNT/live" ]] || [[ -z "$(ls -A "$CERTS_MOUNT/live" 2>/dev/null)" ]]; then
    echo "[INFO] Сертификаты не найдены → initial issuance в режиме init"

    echo "[INFO] Запуск nginx (init)..."
    NODE_ENV=init docker compose --env-file "$ENV_FILE" up -d "$NGINX_CONTAINER_NAME"

    echo "[INFO] Ждём, пока nginx отдаёт /.well-known/acme-challenge/…"
    until [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/.well-known/acme-challenge/healthcheck)" = "404" ]; do
      sleep 1
    done

    echo "[INFO] Выпуск сертификатов через webroot..."
    docker run --rm \
      -v certs:/etc/letsencrypt \
      -v webroot:/var/www/certbot \
      certbot/certbot certonly \
        --webroot -w /var/www/certbot \
        --register-unsafely-without-email \
        --agree-tos --non-interactive \
        $LETSENCRYPT_DOMAINS_ARGS

    echo "[INFO] Initial issuance завершён."
  else
    echo "[INFO] Сертификаты уже есть, initial issuance не требуется."
  fi
else
  echo "[INFO] Development режим — пропускаем initial issuance и запуск nginx (init)."
fi

######################################
# Запуск / перезапуск nginx в нужном режиме
######################################

echo "[INFO] Перезапуск nginx в режиме $MODE..."

docker compose --env-file "$ENV_FILE" down

NODE_ENV=$MODE docker compose --env-file "$ENV_FILE" up -d "$NGINX_CONTAINER_NAME"

######################################
# Настройка cron-задачи для renew (только не dev)
######################################

if [[ "$MODE" != "development" ]]; then
  echo "[INFO] Настройка cron-задачи (каждые $CERTBOT_RENEW_INTERVAL_DAYS дней)..."

  CRON_LINE="0 3 */${CERTBOT_RENEW_INTERVAL_DAYS} * * root $RENEW_SCRIPT >> /var/log/certbot-renew.log 2>&1"
  sudo bash -c "echo '$CRON_LINE' > $CRON_FILE"
  sudo chmod 644 "$CRON_FILE"

  echo "[INFO] Всё готово — cron для certbot-renew.sh настроен."
else
  echo "[INFO] Development режим — пропускаем настройку cron-задачи."
fi
