# frozen_string_literal: true

source 'https://rubygems.org'

ruby '2.7.2'

gem 'activesupport', '~> 6.0'
gem 'anbt-sql-formatter', '~> 0.1', require: 'anbt-sql-formatter/formatter'
gem 'pg', '~> 1.2'
gem 'roda', '~> 3.29'
gem 'sequel', '~> 5.29'
gem 'sequel_pg', '~> 1.12', require: false

group :development, :test do
  gem 'pry', '~> 0.13'
  gem 'pry-remote', '~> 0.1'
  gem 'rake', '~> 13.0'
  gem 'rspec', '~> 3.9'
  gem 'rubocop', '~> 0.79', require: false
  gem 'rubocop-rspec', require: false
end

group :development do
  gem 'rack-unreloader', '~> 1.7'
end

group :test do
  gem 'benchmark-ips', '~> 2.7'
  gem 'capybara'
  gem 'selenium-webdriver'
  gem 'warning'
end
