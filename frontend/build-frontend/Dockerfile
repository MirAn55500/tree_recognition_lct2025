FROM node:latest as frontend

WORKDIR /app

COPY .npmrc ./
COPY ./package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN ls -la /app/
