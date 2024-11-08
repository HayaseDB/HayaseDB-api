LABEL version="1.0.0"
LABEL description="HayaseDB API Service Image"
LABEL maintainer="info@hayasedb.com"
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

ARG NODE_ENV=production
RUN npm install

COPY ./src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]
