# frozen_string_literal: true

require 'rack/unreloader'
require 'logger'

case ENV['RACK_ENV']
when 'development'
  LOGGER = Logger.new($stdout)
  UNRELOADER = Rack::Unreloader.new(subclasses: %w[Roda Sequel::Model], logger: LOGGER) { App }
  UNRELOADER.require('app/app.rb') { 'App' }
  run(UNRELOADER)
else
  require_relative 'app/app'
  run(App.freeze.app)
end
