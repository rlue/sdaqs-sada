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

EXPOSE 9292
CMD ["bundle", "exec", "rackup", "-o", "0.0.0.0"]
