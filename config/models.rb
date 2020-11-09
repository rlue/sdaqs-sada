# frozen_string_literal: true

require 'logger'
require 'sequel/model'
require './config/db'

class Roda
  module Config
    module Models
      def self.add_logger(level = :debug)
        ::LOGGER ||= Logger.new($stdout, level: level)
        DB.loggers << ::LOGGER
      end

      def self.configure_sequel(cached: true, subclasses: true)
        Sequel::Model.cache_associations = cached
        Sequel::Model.plugin :auto_validations
        Sequel::Model.plugin :prepared_statements
        Sequel::Model.plugin :subclasses if subclasses
      end

      def self.unreload_models
        ::UNRELOADER ||= Rack::Unreloader.new
        ::UNRELOADER.require('app/models') do |f|
          Sequel::Model.send(:camelize, File.basename(f).sub(/\.rb\z/, ''))
        end
      end

      def self.load_models
        Pathname.new(__dir__).parent
          .then { |root_dir| root_dir.join('app', 'models', '*.rb') }
          .then { |models_glob| Dir[models_glob] }
          .then { |model_files| model_files.each(&method(:require)) }
      end

      def self.make_immutable
        Sequel::Model.freeze_descendents
        DB.freeze
      end
    end
  end
end

case ENV['RACK_ENV']
when 'development'
  require 'rack/unreloader'

  Roda::Config::Models.add_logger
  Roda::Config::Models.configure_sequel(cached: false, subclasses: false)
  Roda::Config::Models.unreload_models
when 'test'
  Roda::Config::Models.add_logger(:fatal)
  Roda::Config::Models.configure_sequel
  Roda::Config::Models.load_models
  Roda::Config::Models.make_immutable
else
  Roda::Config::Models.configure_sequel
  Roda::Config::Models.load_models
  Roda::Config::Models.make_immutable
end
