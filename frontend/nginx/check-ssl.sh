#!/bin/sh

if [ -f /etc/nginx/ssl/live/ims-mts.ru/fullchain.pem ]; then
    mv /etc/nginx/conf.d/ssl.conf /etc/nginx/conf.d/ssl.conf.enabled
else
    mv /etc/nginx/conf.d/ssl.conf.enabled /etc/nginx/conf.d/ssl.conf 2>/dev/null || true
fi 