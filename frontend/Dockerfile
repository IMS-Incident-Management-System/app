FROM node AS build

WORKDIR /usr/src/fe
COPY . .
RUN npm install
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /usr/src/fe/dist /usr/share/nginx/html
COPY --from=build /usr/src/fe/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/fe/nginx/ssl.conf /etc/nginx/conf.d/ssl.conf
COPY --from=build /usr/src/fe/nginx/check-ssl.sh /docker-entrypoint.d/40-check-ssl.sh

RUN chmod +x /docker-entrypoint.d/40-check-ssl.sh

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]