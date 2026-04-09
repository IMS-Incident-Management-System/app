# IMS - Система управления инцидентами

0. Остановить то, что держит том (на время)
cd ~/app   # где docker-compose
sudo docker-compose stop ims-nginx ims-keycloak ims-backend 2>/dev/null || true
sudo docker compose stop ims-nginx ims-keycloak ims-backend 2>/dev/null || true
(если какой‑то сервиса нет — не страшно.)

1. Бэкап всего тома (на всякий)
mkdir -p ~/certs-volume-backup
sudo docker run --rm \
  -v certs:/certs:ro \
  -v "$HOME/certs-volume-backup:/backup" \
  alpine tar czf "/backup/certs-backup-$(date +%Y%m%d-%H%M).tgz" -C /certs .
2. Полностью очистить содержимое тома certs
sudo docker run --rm -v certs:/certs alpine sh -c 'rm -rf /certs/* /certs/.[!.]* 2>/dev/null; ls -la /certs'
В конце ls должен показать пусто (или только . и ..).

3. Залить заново из ~/certs-in
Папка в live/ должна совпадать с путями в KC_COMMAND и nginx. Ниже пример как у вас было: 0000PAMKIIAVDB.msk.mts.ru. Если у тебя другое имя каталога — замени одну строку CERTDIR.

CERTDIR="0000PAMKIIAVDB.msk.mts.ru"
sudo docker run --rm \
  -v certs:/etc/letsencrypt \
  -v "$HOME/certs-in:/from:ro" \
  alpine sh -c "
    mkdir -p /etc/letsencrypt/live/$CERTDIR &&
    cp /from/fullchain.pem /etc/letsencrypt/live/$CERTDIR/fullchain.pem &&
    cp /from/privkey.pem   /etc/letsencrypt/live/$CERTDIR/privkey.pem &&
    chmod 644 /etc/letsencrypt/live/$CERTDIR/fullchain.pem &&
    chmod 600 /etc/letsencrypt/live/$CERTDIR/privkey.pem &&
    ls -la /etc/letsencrypt/live/$CERTDIR &&
    grep -c 'BEGIN CERTIFICATE' /etc/letsencrypt/live/$CERTDIR/fullchain.pem
  "
Убедись, что в ~/certs-in лежат актуальные fullchain.pem и privkey.pem (те, по которым modulus совпал).

4. Проверка с хоста
sudo docker run --rm -v certs:/certs:ro alpine ls -laR /certs/live
5. Поднять сервисы обратно
cd ~/app
sudo docker-compose up -d
# или: sudo docker compose up -d
Потом:

sudo docker logs ims-keycloak --tail 80
sudo docker exec ims-nginx nginx -t && sudo docker exec ims-nginx nginx -s reload 2>/dev/null || sudo docker-compose restart ims-nginx
Важно: после очистки не останется ims-mts.ru в live/ — если nginx всё ещё смотрит на live/ims-mts.ru/, 443 сломается, пока не поправишь пути в nginx.conf или не заведёшь второй каталог с тем же содержимым.

Если нужно удалить сам том и создать пустой заново (редко нужно):

# только если контейнеры остановлены и том нигде не нужен
sudo docker volume rm certs
sudo docker volume create certs
Дальше снова шаг 3.