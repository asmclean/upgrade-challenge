FROM node:14-alpine as ts-compiler

ENV NODE_ENV build

WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

ENV NODE_ENV production

FROM node:14-alpine as ts-remover
WORKDIR /usr/app
COPY --from=ts-compiler /usr/app/package.json ./
COPY --from=ts-compiler /usr/app ./
RUN npm install --only=production

EXPOSE 3000

CMD [ "node", "dist/main.js" ]