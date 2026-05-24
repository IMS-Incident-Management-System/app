#!/bin/sh
set -e

# Именованный volume /app/node_modules пустой при первом запуске и перекрывает node_modules из образа
if [ ! -d node_modules/nodemon ]; then
  echo "[entrypoint] Установка зависимостей в node_modules volume..."
  npm install --no-audit --no-fund
fi

# На некоторых FS .bin/* теряют +x — nodemon тогда падает с Permission denied
if [ -d node_modules/.bin ]; then
  chmod -R a+x node_modules/.bin 2>/dev/null || true
fi

exec "$@"
