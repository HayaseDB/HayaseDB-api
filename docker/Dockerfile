FROM node:20-alpine

WORKDIR /usr/src/app
ENV FORCE_COLOR=1

COPY . .
RUN npm install

RUN npm run build

CMD ["node", "dist/main"]
