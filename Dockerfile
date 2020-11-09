# syntax = docker/dockerfile:1.1-experimental
FROM ruby:2.7.0-alpine
MAINTAINER Ryan Lue <hello@ryanlue.com>

WORKDIR /app
COPY . /app

# verify Mapbox access token
ARG MAPBOXGL_ACCESS_TOKEN
RUN apk add --no-cache --update curl && \
    export ENDPOINT="https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=$MAPBOXGL_ACCESS_TOKEN";\
    export STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT");\
    test $STATUS -eq 200 \
    && exit 0 \
    || >&2 echo -e "Mapbox access token invalid\nGet one at https://account.mapbox.com,\nthen set it as the MAPBOXGL_ACCESS_TOKEN build arg" \
    && exit 1

# verify DB seed data
RUN stat data/db_seed.sql >/dev/null 2>&1 \
    && exit 0 \
    || >&2 echo -e "data/db_seed.sql: file not found" && exit 1

# system libraries for nokogiri / pg
RUN apk add --no-cache --update \
    build-base \
    postgresql-dev \
    && gem update bundler \
    && bundle install

# generate frontend assets
ENV LANG en_US.utf8
ENV PGDATA /var/lib/postgresql/data
RUN apk add --no-cache --update postgresql \
    ; su postgres -c initdb \
    ; mkdir /run/postgresql && chown postgres.postgres /run/postgresql \
    ; su postgres -c "pg_ctl start" \
    ; createdb -U postgres sdaqs_production \
    ; su postgres -c "APP_DATABASE_URL='postgres:///sdaqs_production' bundle exec rake db:seed" \
    ; chmod o+w data \
    ; su postgres -c "APP_DATABASE_URL='postgres:///sdaqs_production' bundle exec rake secrets:g" \
    ; chmod o-w data && chown root.root data/sites.json \
    ; dropdb -U postgres sdaqs_production \
    ; rm data/db_seed.sql \
    ; stat data/sites.json >/dev/null 2>&1 \
    && exit 0 \
    || >&2 echo -e "data/sites.json: file not found" && exit 1

# build static JS assets
RUN apk add --no-cache --update npm \
    ; npm install \
    ; MAPBOXGL_ACCESS_TOKEN=$MAPBOXGL_ACCESS_TOKEN \
      npx webpack --config config/webpack.js \
    ; rm -rf node_modules

# clean up setup packages
RUN apk del curl postgresql \
    ; rm -rf /var/lib/postgresql /run/postgresql

EXPOSE 9292
CMD ["bundle", "exec", "rackup", "-o", "0.0.0.0"]
