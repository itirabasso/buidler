FROM node

ENV NODE_VERSION=14.6.0
ENV YARN_VERSION=1.22.4

RUN yarn

ARG VERSION

EXPOSE 8545

RUN ["/bin/sh" "-c" "/node_modules/.bin/buidler" "node"]