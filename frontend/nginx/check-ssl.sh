#!/bin/sh

if [ -f /etc/nginx/ssl/live/ims-mts.ru/fullchain.pem ]; then
    ln -sf /etc/nginx/conf.d/ssl.conf /etc/nginx/conf.d/ssl.conf.enabled
else
    rm -f /etc/nginx/conf.d/ssl.conf.enabled
fi 