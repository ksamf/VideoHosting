FROM node:24-alpine

WORKDIR /frontend

COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.* ./
COPY eslint.config.* ./

RUN npm ci

COPY . .

RUN npm run typecheck

EXPOSE 5173

CMD ["npm", "run", "dev"]
