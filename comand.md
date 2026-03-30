cd /app
df -h
sudo docker info | grep -i "Docker Root Dir"
sudo docker-compose build --no-cache ims-backend 2>&1 | tee /tmp/build.log

tail -n 80 /tmp/build.log



sudo docker run --rm \
  -v certs:/certs \
  -v /home/aygarshin/certs-ready:/in \
  alpine sh -c 'mkdir -p /certs/live/0000PAMKIIAVDB.msk.mts.ru && cp /in/fullchain.pem /certs/live/0000PAMKIIAVDB.msk.mts.ru/fullchain.pem && cp /in/privkey.pem /certs/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem && chmod 600 /certs/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem'


  sudo docker run --rm -v certs:/certs alpine ls -la /certs/live/0000PAMKIIAVDB.msk.mts.ru




  KC_OWN_KC_HOSTNAME=0000PAMKIIAVDB.msk.mts.ru
KC_OWN_KEYCLOAK_FRONTEND_URL=https://0000PAMKIIAVDB.msk.mts.ru
BACKEND_KEYCLOAK_URL_ISSUER=https://0000PAMKIIAVDB.msk.mts.ru:8087
LETSENCRYPT_DOMAINS_ARGS="-d 0000PAMKIIAVDB.msk.mts.ru"
KC_COMMAND="start --https-certificate-file=/etc/letsencrypt/live/0000PAMKIIAVDB.msk.mts.ru/fullchain.pem --https-certificate-key-file=/etc/letsencrypt/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem"

# BACKEND_DEV_DOCKERFILE=Dockerfile.dev



5) Проверь nginx prod-конфиг
В nginx/production/nginx.conf должны быть такие пути:
/etc/letsencrypt/live/0000PAMKIIAVDB.msk.mts.ru/fullchain.pem
/etc/letsencrypt/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem
(если там всё ещё ims-mts.ru — замени).





6) Перезапусти сервисы
cd /app
sudo docker-compose up -d --force-recreate ims-keycloak ims-nginx ims-backend
sudo docker-compose ps
Логи для проверки:
sudo docker-compose logs --tail 100 ims-nginx
sudo docker-compose logs --tail 100 ims-keycloak
sudo docker-compose logs --tail 100 ims-backend
Если хочешь, после того как зальёшь файлы в /home/aygarshin/certs-in, просто пришли ls -la /home/aygarshin/certs-in, и я дам next-step ровно под твои имена/пути без лишних движений.


++++++++++++++++++++++++++++++++++++++++++++++

Сделай так (точечно)
cd /app
# 1) Найти "призрачный" контейнер
sudo docker ps -a --format '{{.ID}} {{.Names}}' | rg "_ims-nginx|ims-nginx"
# 2) Удалить найденные контейнеры (все, что относятся к nginx)
sudo docker rm -f a4f6461f1469_ims-nginx 2>/dev/null || true
sudo docker rm -f ims-nginx 2>/dev/null || true
# 3) На всякий случай удалить образ nginx, чтобы чисто пересоздался
sudo docker image rm -f nginx:alpine 2>/dev/null || true
# 4) Поднять только nginx заново
sudo docker-compose up -d --no-deps --force-recreate ims-nginx
Потом проверка:
sudo docker-compose ps
sudo docker-compose logs --tail 80 ims-nginx
Если снова будет тот же ContainerConfig, это уже 99% ограничение docker-compose v1 с твоей версией Docker Engine. Тогда следующий шаг — перейти на docker compose v2 (плагин) и запускать через него.
Но сначала попробуй команды выше: в таких кейсах часто хватает удаления контейнера с хэш-именем.


==================================================


У тебя на сервере нет rg, всё ок — просто без него.
Выполни так:
cd /app
# показать все контейнеры с nginx в имени (без rg)
sudo docker ps -a --format '{{.ID}} {{.Names}}' | grep -E '_ims-nginx|ims-nginx' || true
# удалить все такие контейнеры одной командой
sudo docker ps -a --format '{{.ID}} {{.Names}}' | grep -E '_ims-nginx|ims-nginx' | awk '{print $1}' | xargs -r sudo docker rm -f
# удалить образ nginx
sudo docker image rm -f nginx:alpine || true
# поднять nginx заново
sudo docker-compose up -d --no-deps --force-recreate ims-nginx
# проверка
sudo docker-compose ps
sudo docker-compose logs --tail 80 ims-nginx
Если снова будет ContainerConfig, тогда уже делаем docker-compose down и up -d целиком (без -v).





Нашли корень проблемы: у тебя в бэкенде домен зашит в коде, не в .env.
По логу он ищет:
/app/certs/live/ims-mts.ru/privkey.pem
Это берётся из app/backend/index.ts, там хардкод на ims-mts.ru.
Что поменять
В файле app/backend/index.ts замени:
origin: ['https://ims-mts.ru', 'https://www.ims-mts.ru']
/app/certs/live/ims-mts.ru/privkey.pem
/app/certs/live/ims-mts.ru/fullchain.pem
https://ims-mts.ru:${PORT}/api/v1
на домен:
0000PAMKIIAVDB.msk.mts.ru
Быстро через команды на сервере
cd /app
sed -i 's#https://ims-mts.ru#https://0000PAMKIIAVDB.msk.mts.ru#g' backend/index.ts
sed -i 's#https://www.ims-mts.ru#https://0000PAMKIIAVDB.msk.mts.ru#g' backend/index.ts
sed -i 's#/app/certs/live/ims-mts.ru/#/app/certs/live/0000PAMKIIAVDB.msk.mts.ru/#g' backend/index.ts
# проверить
grep -n "ims-mts.ru\\|0000PAMKIIAVDB.msk.mts.ru\\|/app/certs/live" backend/index.ts
Потом пересобрать и поднять:
sudo docker-compose build --no-cache ims-backend
sudo docker-compose up -d ims-backend ims-nginx
sudo docker-compose ps
И отдельно для nginx у тебя тоже остался старый домен в app/nginx/production/nginx.conf — его тоже нужно заменить на 0000PAMKIIAVDB.msk.mts.ru, иначе следующий падёж будет там.



=====================================================================================

Сейчас у тебя опять тот же баг docker-compose v1 (KeyError: 'ContainerConfig'), но уже для ims-backend при Recreating ....
Бэкенд уже собран успешно — ломается только стадия пересоздания контейнера.
Сделай так (точечно для backend)
cd /app
# 1) Найти все контейнеры backend (включая с хеш-префиксом)
sudo docker ps -a --format '{{.ID}} {{.Names}}' | grep -E '_ims-backend|ims-backend' || true
# 2) Удалить их
sudo docker ps -a --format '{{.ID}} {{.Names}}' | grep -E '_ims-backend|ims-backend' | awk '{print $1}' | xargs -r sudo docker rm -f
# 3) Поднять только backend заново
sudo docker-compose up -d --no-deps --force-recreate ims-backend
# 4) Проверка
sudo docker-compose ps
sudo docker-compose logs --tail 80 ims-backend
Если снова ContainerConfig
Тогда делай полный цикл (без удаления volume):
cd /app
sudo docker-compose down
sudo docker-compose up -d
sudo docker-compose ps
down без -v данные БД не удаляет.
Если даже после down/up это повторится — дальше уже лучше перейти на docker compose v2 (плагин), у v1.29.2 это частый баг на новых Docker Engine.