FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies (only production dependencies)
ARG NODE_ENV
RUN npm ci --only=production

COPY ./src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]
