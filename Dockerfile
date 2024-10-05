FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

ARG NODE_ENV=production
RUN npm install

COPY . .
RUN npm run build

EXPOSE ${API_PORT}

CMD ["npm", "run", "start:prod"]