#!/bin/bash

# Функция для проверки наличия сертификатов в volume
check_certificates() {
    # Проверяем, что volume существует
    if ! docker volume inspect app_ssl-certs >/dev/null 2>&1; then
        echo "SSL certificates volume not found"
        return 1
    fi

    echo "Checking certificates in volume app_ssl-certs..."
    
    # Проверяем наличие сертификатов в volume через временный контейнер
    if docker run --rm -v app_ssl-certs:/etc/letsencrypt alpine test -f /etc/letsencrypt/live/ims-mts.ru/fullchain.pem; then
        echo "Certificates found in volume!"
        return 0
    else
        echo "Certificates not found in volume yet"
        return 1
    fi
}

# Запускаем SSL сервисы
echo "Starting SSL services..."
docker compose --profile ssl up --build -d

# Ждем, пока сертификаты появятся
echo "Waiting for SSL certificates..."
while ! check_certificates; do
    echo "Certificates not found yet, waiting..."
    sleep 10
done

echo "SSL certificates found!"

# Запускаем основное приложение
echo "Starting main application..."
docker compose --profile app up --build

echo "All services are up and running!"