# based on https://logfetch.com/docker-typescript-production/
FROM node:18-alpine as ts-compiler
RUN apk add --no-cache git
WORKDIR /app
RUN --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
    --mount=type=cache,id=yarn,target=/root/.yarn,sharing=locked \
    yarn install --network-timeout 100000

COPY . ./
RUN --mount=type=cache,id=yarn,target=/root/.yarn,sharing=locked \
    yarn run build

FROM node:18-alpine as ts-remover
RUN apk add --no-cache git
WORKDIR /app
COPY --from=ts-compiler /app/*.lock ./
COPY --from=ts-compiler /app/package*.json ./
COPY --from=ts-compiler /app/build ./

RUN --mount=type=cache,id=yarn,target=/root/.yarn,sharing=locked \
    yarn install --production=true --network-timeout 100000

FROM gcr.io/distroless/nodejs:18
WORKDIR /app
COPY --from=ts-remover /app ./
COPY ./views /views
EXPOSE 80
CMD ["server.js"]