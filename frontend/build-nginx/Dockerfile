FROM nginx:alpine

COPY ./build-nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=frontend /app/dist /usr/share/nginx/html

RUN ls -la /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]