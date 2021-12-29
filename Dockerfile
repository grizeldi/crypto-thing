FROM node:current-alpine3.14

ARG NODE_ENV=development
ARG PORT=5000
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ${PORT}

ENTRYPOINT [ "npm", "run", "backend" ]