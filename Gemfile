# frozen_string_literal: true

source 'https://rubygems.org'

ruby '2.7.0'

gem 'pg', '~> 1.2'
gem 'rack-unreloader', '~> 1.7'
gem 'roda', '~> 3.29'
gem 'sequel', '~> 5.29'
gem 'sequel_pg', '~> 1.12'

group :development, :test do
  gem 'pry', git: 'https://github.com/pry/pry.git', ref: '272b3290b5250d28ee82a5ff65aa3b29b825e37b'
  gem 'rake', '~> 13.0'
  gem 'rspec', '~> 3.9'
  gem 'rubocop', '~> 0.79', require: false
  gem 'rubocop-rspec', require: false
end

group :test do
  gem 'benchmark-ips', '~> 2.7'
end
