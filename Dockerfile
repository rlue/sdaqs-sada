# syntax = docker/dockerfile:1.1-experimental
FROM ruby:2.7.0-alpine
MAINTAINER Ryan Lue <hello@ryanlue.com>

WORKDIR /app
COPY . /app

# verify Mapbox access token
ARG MAPBOXGL_ACCESS_TOKEN
RUN apk add --no-cache --update curl
RUN export ENDPOINT="https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=$MAPBOXGL_ACCESS_TOKEN";\
    export STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT");\
    test $STATUS -eq 200 && \
    exit 0 || \
    >&2 echo -e "Mapbox access token invalid\nGet one at https://account.mapbox.com,\nthen set it as the MAPBOXGL_ACCESS_TOKEN build arg" && \
    exit 1

# system libraries for nokogiri / pg
RUN apk add --no-cache --update \
    build-base \
    postgresql-dev
RUN gem update bundler
RUN bundle install

# build static JS assets
RUN apk add --no-cache --update npm
RUN npm install
RUN MAPBOXGL_ACCESS_TOKEN=$MAPBOXGL_ACCESS_TOKEN \
    npx webpack --config config/webpack.js
RUN rm -rf node_modules

EXPOSE 9292
CMD ["bundle", "exec", "rackup", "-o", "0.0.0.0"]
