FROM node:16-alpine as ts-compiler
RUN apk add git
WORKDIR /app
COPY *.lock ./
COPY package*.json ./
COPY tsconfig*.json ./
RUN yarn install
COPY . ./
RUN yarn run build

FROM node:16-alpine as ts-remover
RUN apk add git
WORKDIR /app
COPY --from=ts-compiler /app/*.lock ./
COPY --from=ts-compiler /app/package*.json ./
COPY --from=ts-compiler /app/build ./
RUN yarn install --production=true

FROM gcr.io/distroless/nodejs:16
WORKDIR /app
COPY --from=ts-remover /app ./
COPY ./views /views
EXPOSE 80
CMD ["server.js"]