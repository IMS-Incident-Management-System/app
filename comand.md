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