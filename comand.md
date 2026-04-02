cd /app
df -h
sudo docker info | grep -i "Docker Root Dir"
sudo docker-compose build --no-cache ims-backend 2>&1 | tee /tmp/build.log

tail -n 80 /tmp/build.log



docker volume create certs 2>/dev/null || true

docker run --rm \
  -v certs:/etc/letsencrypt \
  -v /home/aygarshin/certs-ready:/from:ro \
  alpine sh -c '
    mkdir -p /etc/letsencrypt/live/0000pamkiiavdb.msk.mts.ru &&
    cp /from/fullchain.pem /etc/letsencrypt/live/0000pamkiiavdb.msk.mts.ru/fullchain.pem &&
    cp /from/privkey.pem   /etc/letsencrypt/live/0000pamkiiavdb.msk.mts.ru/privkey.pem &&
    chmod 644 /etc/letsencrypt/live/0000pamkiiavdb.msk.mts.ru/fullchain.pem &&
    chmod 600 /etc/letsencrypt/live/0000pamkiiavdb.msk.mts.ru/privkey.pem
  '


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


++++++++++++++++++++++++++++++


Собрать frontend/dist без установки npm на сервер
cd /app
# 1) сборка фронта в одноразовом контейнере
sudo docker run --rm \
  -v /app/frontend:/work \
  -w /work \
  -e npm_config_registry=https://nexus-cache.services.mts.ru/repository/npm-all/ \
  node:18-alpine \
  sh -c "npm config set strict-ssl false && npm install --no-audit --no-fund && npm run build"
Проверить, что dist появился
ls -la /app/frontend/dist
Перезапустить nginx
cd /app
sudo docker-compose restart ims-nginx
Потом открой сайт снова.
Если всё ещё 403, сразу дай:
sudo docker-compose logs --tail 80 ims-nginx
sudo docker exec ims-nginx ls -la /usr/share/nginx/html
Тогда добьём за 1 шаг.


=======================================

Сделай ровно так, одной командой (без переносов):
sudo docker run --rm -v /app/frontend:/work -w /work -e npm_config_registry=https://nexus-cache.services.mts.ru/repository/npm-all/ node:18-alpine sh -lc "npm config set strict-ssl false && npm install --no-audit --no-fund && npm run build"
Потом:
ls -la /app/frontend/dist
cd /app
sudo docker-compose restart ims-nginx
Если снова не откроется:
sudo docker-compose logs --tail 80 ims-nginx
Ты уже в финишной точке, тут чисто техническая опечатка команды была.



++++++++++++++++++++++++++++++++++++++++

Всё ок, причина понятна: контейнеру снова не примонтировалась папка с фронтом, поэтому в /work нет package.json.
Сделай максимально надёжно — от текущей директории:
cd /app
ls -la frontend/package.json
sudo docker run --rm -v "$(pwd)/frontend:/work" -w /work -e npm_config_registry=https://nexus-cache.services.mts.ru/repository/npm-all/ node:18-alpine sh -lc "npm config set strict-ssl false && npm install --no-audit --no-fund && npm run build"
Если первая команда (ls -la frontend/package.json) скажет “No such file”, значит проект лежит не в /app, а в ~/app. Тогда:
cd ~/app
ls -la frontend/package.json
sudo docker run --rm -v "$(pwd)/frontend:/work" -w /work -e npm_config_registry=https://nexus-cache.services.mts.ru/repository/npm-all/ node:18-alpine sh -lc "npm config set strict-ssl false && npm install --no-audit --no-fund && npm run build"
После успешной сборки:
ls -la /app/frontend/dist || ls -la ~/app/frontend/dist
cd /app && sudo docker-compose restart ims-nginx
Ключевой момент: используй $(pwd)/frontend, чтобы не промахнуться с абсолютным путём.
=============================================

Сделай так по шагам
cd /app
# 1) Пересоздать только связку keycloak + его БД
sudo docker-compose stop ims-keycloak ims-keycloak-db
sudo docker-compose rm -f ims-keycloak ims-keycloak-db
sudo docker-compose up -d ims-keycloak-db
sleep 5
sudo docker-compose up -d ims-keycloak
Проверка:
sudo docker-compose ps
sudo docker-compose logs --tail 120 ims-keycloak-db
sudo docker-compose logs --tail 120 ims-keycloak
Быстрая проверка DNS внутри контейнера Keycloak
sudo docker exec -it ims-keycloak getent hosts ims-keycloak-db
если вернул IP — DNS ок,
если пусто — контейнеры не в одной сети/сервис не поднят.
Если снова UnknownHostException
Тогда пришли вывод двух команд:
sudo docker inspect ims-keycloak --format '{{json .NetworkSettings.Networks}}'
sudo docker inspect ims-keycloak-db --format '{{json .NetworkSettings.Networks}}'
Там сразу видно, в одной ли они сети.
Когда ims-keycloak станет Up, ошибка 502 на /auth должна уйти.


++++++++++++++++++++++++++++++++++++++++++++++++

Сделай проверку (2 команды)
cd /app
sudo docker exec ims-nginx sh -lc "apk add --no-cache curl >/dev/null 2>&1 || true; curl -vk http://ims-keycloak:8080/realms/master; echo '---'; curl -vk https://ims-keycloak:8443/realms/master"
sudo docker-compose logs --tail 80 ims-keycloak
Дальше выбери один режим и сделай его консистентным
Вариант A (быстро и стабильно): Keycloak по HTTP внутри сети
В /app/.env:
KC_COMMAND=start-dev
KC_PORT_MAPPING=8087:8080
BACKEND_KEYCLOAK_URL=http://ims-keycloak:8080
В nginx:
location /auth/ {
  proxy_pass http://ims-keycloak:8080/;
}
Вариант B (строго prod TLS): Keycloak по HTTPS внутри
В /app/.env:
KC_COMMAND="start --https-certificate-file=/etc/letsencrypt/live/0000PAMKIIAVDB.msk.mts.ru/fullchain.pem --https-certificate-key-file=/etc/letsencrypt/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem"
KC_PORT_MAPPING=8087:8443
BACKEND_KEYCLOAK_URL=https://ims-keycloak:8443
В nginx:
location /auth/ {
  proxy_pass https://ims-keycloak:8443/;
  proxy_ssl_verify off;
}
После правок
cd /app
sudo docker-compose up -d --force-recreate ims-keycloak ims-nginx ims-backend
sudo docker-compose ps
Если хочешь, пойдем по варианту A (быстрее) — и я дам точный минимальный diff по твоим текущим файлам.


=================================================================


Что делаем сейчас
1) Больше не использовать --force-recreate
Не запускай:
docker-compose up -d --force-recreate ...
Используй только:
docker-compose up -d
docker restart <container>
2) Проверить, что контейнеры живы
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
3) Причина 502 на /auth
У тебя в nginx сейчас:
proxy_pass http://ims-keycloak:8080/;
А Keycloak в проде у тебя обычно с HTTPS (KC_COMMAND start --https...), значит upstream должен быть по https:8443.
В app/nginx/production/nginx.conf в location /auth/ поставь:
proxy_pass https://ims-keycloak:8443/;
proxy_ssl_server_name on;
proxy_ssl_verify off;
(остальные proxy_set_header оставь как есть)
4) Применить без compose recreate
sudo docker restart ims-nginx
sudo docker logs --tail 80 ims-nginx
5) Проверка
Открой:
https://0000pamkiiavdb.msk.mts.ru/auth/
https://0000pamkiiavdb.msk.mts.ru/auth/realms/ims/.well-known/openid-configuration
Если после этого 502 останется — пришли только 2 вывода:
sudo docker logs --tail 120 ims-nginx
sudo docker logs --tail 120 ims-keycloak
И добьем точечно, но уже без ломания всего стека.


++++++++++++++++++++++++++++++


cd /app/frontend
# если npm на хосте нет, собирай через node-контейнер как раньше
cd /app
sudo docker run --rm -v "$(pwd)/frontend:/work" -w /work -e npm_config_registry=https://nexus-cache.services.mts.ru/repository/npm-all/ node:18-alpine sh -lc "npm config set strict-ssl false && npm install --no-audit --no-fund && npm run build"
sudo docker-compose restart ims-nginx
Если хочешь оставить внешний путь именно /auth, тоже можно, но тогда отдельно подправим nginx/keycloak на явный relative-path. Сейчас самый быстрый путь — убрать /auth из фронта и проверить вход.


++++++

cd /app
sudo docker run --rm -v "$(pwd)/frontend:/work" -w /work -e npm_config_registry=https://nexus-cache.services.mts.ru/repository/npm-all/ node:18-alpine sh -lc "npm config set strict-ssl false && npm install --no-audit --no-fund && npm run build"
sudo docker-compose restart ims-nginx


++++++++++++++++++++++++++++++++++++++++++++++++

2) Почему не собирается фронт
Ошибка ENOENT /work/package.json = контейнеру примонтировали не ту папку.
Сделай железно через общий mount /app:
cd /app
ls -la frontend/package.json
sudo docker run --rm \
  -v /app:/src \
  -w /src/frontend \
  -e npm_config_registry=https://nexus-cache.services.mts.ru/repository/npm-all/ \
  node:18-alpine \
  sh -lc "npm config set strict-ssl false && npm install --no-audit --no-fund && npm run build"
Проверка:
ls -la /app/frontend/dist
sudo docker-compose restart ims-nginx


sudo ls -la "$(docker volume inspect certs --format '{{ .Mountpoint }}')/live"


++++++++++++++++++++++++++++++++++++++++++++++++++++


Сделай так на сервере
1) Подготовь файлы

mkdir -p /home/aygarshin/certs-ready
cp /path/to/dbbbmts_le_key.pem /home/aygarshin/certs-ready/privkey.pem
cat /path/to/dbbbmts_le.pem /path/to/dbbbmts_le_chain.pem > /home/aygarshin/certs-ready/fullchain.pem

> Важно: порядок именно cert + chain.
2) Проверь, что ключ и сертификат пара

openssl x509 -noout -modulus -in /home/aygarshin/certs-ready/fullchain.pem | openssl md5
openssl rsa  -noout -modulus -in /home/aygarshin/certs-ready/privkey.pem | openssl md5

Хэши должны совпасть.
3) Проверь цепочку
openssl verify -CAfile /path/to/dbbbmts_le_chain.pem /path/to/dbbbmts_le.pem
Должно быть OK.
4) Скопируй в volume certs по нужному домену
sudo docker run --rm \
  -v certs:/certs \
  -v /home/aygarshin/certs-ready:/in \
  alpine sh -c 'mkdir -p /certs/live/0000PAMKIIAVDB.msk.mts.ru && cp /in/fullchain.pem /certs/live/0000PAMKIIAVDB.msk.mts.ru/fullchain.pem && cp /in/privkey.pem /certs/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem && chmod 600 /certs/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem'
5) Перезапусти только keycloak
cd /app
sudo docker-compose up -d --no-deps ims-keycloak
sudo docker-compose logs --tail 120 ims-keycloak
Частые причины этой ошибки
перепутан порядок в fullchain.pem
не та chain (не для этого cert)
ключ не от этого сертификата
в KC_COMMAND указан старый путь/старый домен
Если хочешь, скинь вывод 3 проверок (modulus, verify, и KC_COMMAND из .env) — скажу точно, где именно несостыковка


==============================================================

1) Собрать fullchain.pem и privkey.pem
mkdir -p /home/aygarshin/certs-ready
# cert + chain = fullchain
cat /home/aygarshin/certs-in/dbbbmts_le.pem /home/aygarshin/certs-in/dbbbmts_le_chain.pem > /home/aygarshin/certs-ready/fullchain.pem
# ключ
cp /home/aygarshin/certs-in/dbbbmts_le_key.pem /home/aygarshin/certs-ready/privkey.pem
# если файлы с Windows-переносами
sed -i 's/\r$//' /home/aygarshin/certs-ready/fullchain.pem /home/aygarshin/certs-ready/privkey.pem
chmod 600 /home/aygarshin/certs-ready/privkey.pem
2) Проверить, что ключ и сертификат пара
openssl x509 -noout -modulus -in /home/aygarshin/certs-in/dbbbmts_le.pem | openssl md5
openssl rsa  -noout -modulus -in /home/aygarshin/certs-in/dbbbmts_le_key.pem | openssl md5
Хэши должны совпасть.
3) Проверить, что сертификат на ваш домен
openssl x509 -in /home/aygarshin/certs-in/dbbbmts_le.pem -noout -text | grep -A2 "Subject Alternative Name"
Там должен быть DNS:0000PAMKIIAVDB.msk.mts.ru.
Если его нет — Keycloak/Nginx будут падать/ругаться на цепочку/домен.
4) Положить сертификаты в docker volume certs
Проверка:
5) Перезапуск без up (чтобы обойти баг v1 ContainerConfig)
Найди имена контейнеров keycloak/nginx и перезапусти именно их:
(например у тебя это может быть 7bla14f136e3_ims-keycloak и 2161318225d2_ims-nginx)
Если после этого Keycloak всё ещё пишет Certificate chain is not valid, пришли вывод команды с Subject Alternative Name — сразу скажу, проблема в домене сертификата или в цепочке.


+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


Сделай ровно эти команды:
# 1) Подготовить файлы
mkdir -p /home/aygarshin/certs-ready
cp /home/aygarshin/certs-in/dbbbmts_le_key.pem /home/aygarshin/certs-ready/privkey.pem
cat /home/aygarshin/certs-in/dbbbmts_le.pem /home/aygarshin/certs-in/dbbbmts_le_chain.pem > /home/aygarshin/certs-ready/fullchain.pem
chmod 600 /home/aygarshin/certs-ready/privkey.pem
# 2) Положить в docker volume certs под нужный домен
sudo docker run --rm \
  -v certs:/certs \
  -v /home/aygarshin/certs-ready:/in \
  alpine sh -c 'mkdir -p /certs/live/0000PAMKIIAVDB.msk.mts.ru && cp /in/fullchain.pem /certs/live/0000PAMKIIAVDB.msk.mts.ru/fullchain.pem && cp /in/privkey.pem /certs/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem && chmod 600 /certs/live/0000PAMKIIAVDB.msk.mts.ru/privkey.pem'
# 3) Проверить, что файлы реально в volume
sudo docker run --rm -v certs:/certs alpine ls -la /certs/live/0000PAMKIIAVDB.msk.mts.ru
# 4) Перезапустить keycloak и nginx
cd /app
sudo docker-compose restart ims-keycloak ims-nginx
sudo docker-compose ps
sudo docker-compose logs --tail 120 ims-keycloak
Если после этого в Keycloak останется Certificate chain is not valid, значит порядок в fullchain.pem не подходит. Тогда сделай альтернативно:
cat /home/aygarshin/certs-in/dbbbmts_le_chain.pem /home/aygarshin/certs-in/dbbbmts_le.pem > /home/aygarshin/certs-ready/fullchain.pem
и повтори шаги 2–4.