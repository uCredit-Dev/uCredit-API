FROM node:16

WORKDIR /code
COPY . /code

RUN npm install
RUN npm install -g nodemon
