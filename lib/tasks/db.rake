# frozen_string_literal: true

namespace :db do
  desc 'Run migrations'
  task :migrate, [:version] do |_, args|
    require 'sequel/core'

    Sequel.extension :migration
    version = args[:version].to_i if args[:version]

    Sequel.connect(ENV.fetch('APP_DATABASE_URL')) do |db|
      Sequel::Migrator.run(db, 'db/migrate', target: version)
    end
  end

  desc 'Populate database with seed data'
  task :seed do
    require './config/models'

    DB.logger = nil
    load 'db/seeds.rb'
  end
end
