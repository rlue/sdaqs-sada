# syntax = docker/dockerfile:1.1-experimental
FROM ruby:2.7.0-alpine
MAINTAINER Ryan Lue <hello@ryanlue.com>

WORKDIR /app
COPY . /app

# system libraries for nokogiri / pg
RUN apk add --no-cache --update \
    build-base \
    postgresql-dev
RUN gem update bundler
RUN bundle install

# build static JS assets
RUN apk add --no-cache --update npm
RUN npm install
ARG MAPBOXGL_ACCESS_TOKEN
RUN MAPBOXGL_ACCESS_TOKEN=$MAPBOXGL_ACCESS_TOKEN \
    npx webpack --config config/webpack.js
RUN rm -rf node_modules

EXPOSE 9292
CMD ["bundle", "exec", "rackup", "-o", "0.0.0.0"]
