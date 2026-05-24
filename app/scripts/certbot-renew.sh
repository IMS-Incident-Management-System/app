#!/usr/bin/env bash
set -euo pipefail

SCRIPTS_DIR="$(dirname "$(readlink -f "$0")")"
PROJECT_DIR="$SCRIPTS_DIR/.."
ENV_FILE="$PROJECT_DIR/.env"

source "$ENV_FILE"

cd "$PROJECT_DIR"

echo "[INFO] Запуск обновления сертификатов certbot..."

# Выполняем renew и логируем результат
if docker run --rm \
    -v certs:/etc/letsencrypt \
    -v webroot:/var/www/certbot \
    certbot/certbot renew --webroot -w /var/www/certbot; then
  echo "[INFO] Сертификаты успешно проверены/обновлены."
else
  echo "[ERROR] Ошибка при обновлении сертификатов."
  exit 1
fi

# Проверим, обновились ли сертификаты
# Для этого можно проверить дату изменения директории live
CERTS_MOUNT="$(docker volume inspect certs -f '{{ .Mountpoint }}')"
LIVE_DIR="$CERTS_MOUNT/live"

# Запишем текущее время обновления сертификатов в файл при каждом успешном обновлении
TIMESTAMP_FILE="$PROJECT_DIR/.certs_timestamp"

LAST_UPDATE=0
if [[ -f "$TIMESTAMP_FILE" ]]; then
  LAST_UPDATE=$(cat "$TIMESTAMP_FILE")
fi

CURRENT_UPDATE=$(stat -c %Y "$LIVE_DIR")

if (( CURRENT_UPDATE > LAST_UPDATE )); then
  echo "[INFO] Обнаружены обновленные сертификаты, перезагружаем nginx..."
  docker compose exec "$NGINX_CONTAINER_NAME" nginx -s reload
  echo "$CURRENT_UPDATE" > "$TIMESTAMP_FILE"
else
  echo "[INFO] Сертификаты не обновлялись, перезагрузка nginx не требуется."
fi
