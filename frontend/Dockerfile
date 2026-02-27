FROM node:24-alpine

WORKDIR /frontend

COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.* ./
COPY eslint.config.* ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine3.23-perl
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=0 /frontend/dist /usr/share/nginx/html
EXPOSE 80
