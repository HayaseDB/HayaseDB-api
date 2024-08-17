FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --only=production; \
    else \
      npm install; \
    fi

RUN if [ "$NODE_ENV" != "production" ]; then \
      npm install -g nodemon; \
    fi

COPY ./src ./src

EXPOSE 3000

CMD if [ "$NODE_ENV" = "production" ]; then \
      node src/index.js; \
    else \
      nodemon --legacy-watch src/index.js; \
    fi
