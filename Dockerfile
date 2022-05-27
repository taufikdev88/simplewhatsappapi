FROM node:16-alpine as ts-compiler

RUN apk add git
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:16-alpine as ts-remover
WORKDIR /app
COPY --from=ts-compiler /app/package*.json ./
COPY --from=ts-compiler /app/build ./
RUN npm install --only=production

FROM gcr.io/distroless/nodejs:16
WORKDIR /app
COPY --from=ts-remover /app ./
USER 1000
CMD ["index.js"]