FROM node:16

WORKDIR /code
COPY package.json ./

RUN npm install
RUN npm install -g nodemon
COPY . /code