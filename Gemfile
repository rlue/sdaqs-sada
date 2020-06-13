# frozen_string_literal: true

source 'https://rubygems.org'

ruby '2.7.0'

gem 'pg', '~> 1.2'
gem 'rack-unreloader', '~> 1.7'
gem 'roda', '~> 3.29'
gem 'sequel', '~> 5.29'
gem 'sequel_pg', '~> 1.12'

group :development, :test do
  gem 'pry', '~> 0.13'
  gem 'rake', '~> 13.0'
  gem 'rspec', '~> 3.9'
  gem 'rubocop', '~> 0.79', require: false
  gem 'rubocop-rspec', require: false
end

group :test do
  gem 'benchmark-ips', '~> 2.7'
  gem 'capybara'
  gem 'selenium-webdriver'
  gem 'warning'
end
