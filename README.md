# IMS — система управления инцидентами

## Полная перезаливка Docker-тома `certs`

Том `certs` в `docker-compose` объявлен как **external** — том **не удаляем**, очищаем **содержимое** и заново кладём `fullchain.pem` и `privkey.pem`.

**Перед началом:** в `~/certs-in` должны лежать актуальные `fullchain.pem` и `privkey.pem` (проверка пары: `openssl x509` / `openssl rsa` по modulus).

**Важно:** каталог в `live/<имя>/` должен **совпадать** с путями в `KC_COMMAND` и в `nginx` (`ssl_certificate` / `ssl_certificate_key`). После очистки пути вида `live/ims-mts.ru/` исчезнут — при необходимости поправь `nginx.conf` или заведи тот же каталог.

---

### 0. Остановить сервисы, использующие том (на время)

```bash
cd ~/app   # каталог с docker-compose.yaml

sudo docker-compose stop ims-nginx ims-keycloak ims-backend 2>/dev/null || true
sudo docker compose stop ims-nginx ims-keycloak ims-backend 2>/dev/null || true
```

Если какого-то сервиса нет — не страшно.

---

### 1. Бэкап всего тома (на всякий случай)

```bash
mkdir -p ~/certs-volume-backup

sudo docker run --rm \
  -v certs:/certs:ro \
  -v "$HOME/certs-volume-backup:/backup" \
  alpine tar czf "/backup/certs-backup-$(date +%Y%m%d-%H%M).tgz" -C /certs .
```

---

### 2. Полностью очистить содержимое тома `certs`

```bash
sudo docker run --rm -v certs:/certs alpine sh -c 'rm -rf /certs/* /certs/.[!.]* 2>/dev/null; ls -la /certs'
```

В выводе `ls` должно быть пусто (или только `.` и `..`).

---

### 3. Залить сертификаты заново из `~/certs-in`

Подставь нужное имя каталога в переменную окружения **`CERTDIR`** (должно совпадать с путями в Keycloak и nginx).

```bash
sudo docker run --rm \
  -v certs:/etc/letsencrypt \
  -v "$HOME/certs-in:/from:ro" \
  -e CERTDIR=0000PAMKIIAVDB.msk.mts.ru \
  alpine sh -c '
    mkdir -p /etc/letsencrypt/live/$CERTDIR &&
    cp /from/fullchain.pem /etc/letsencrypt/live/$CERTDIR/fullchain.pem &&
    cp /from/privkey.pem   /etc/letsencrypt/live/$CERTDIR/privkey.pem &&
    chmod 644 /etc/letsencrypt/live/$CERTDIR/fullchain.pem &&
    chmod 600 /etc/letsencrypt/live/$CERTDIR/privkey.pem &&
    ls -la /etc/letsencrypt/live/$CERTDIR &&
    grep -c "BEGIN CERTIFICATE" /etc/letsencrypt/live/$CERTDIR/fullchain.pem
  '
```

---

### 4. Проверка содержимого тома

```bash
sudo docker run --rm -v certs:/certs:ro alpine ls -laR /certs/live
```

---

### 5. Запуск сервисов и проверка

```bash
cd ~/app

sudo docker-compose up -d
# или:
# sudo docker compose up -d
```

```bash
sudo docker logs ims-keycloak --tail 80
```

```bash
sudo docker exec ims-nginx nginx -t
sudo docker exec ims-nginx nginx -s reload 2>/dev/null || sudo docker-compose restart ims-nginx
```

---

### Опционально: удалить том `certs` и создать заново

Только если контейнеры остановлены и том нигде не подключён.

```bash
sudo docker volume rm certs
sudo docker volume create certs
```

После этого выполни снова **шаг 3**.
