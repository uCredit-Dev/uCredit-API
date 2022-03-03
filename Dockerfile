FROM node:16

WORKDIR /code
COPY package.json ./

RUN npm install
COPY . /code

CMD ["node", "."]