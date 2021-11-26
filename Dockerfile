FROM node:16-stretch

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci

COPY ./ ./

EXPOSE 3000

ENTRYPOINT npm run start:dev