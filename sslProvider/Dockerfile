FROM nginx:stable-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Создаем директорию для certbot
RUN mkdir -p /var/www/certbot

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 