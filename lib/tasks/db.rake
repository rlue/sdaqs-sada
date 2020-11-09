# frozen_string_literal: true

require 'pathname'

PROJECT_ROOT = Pathname.new(__dir__).parent.parent
DB_SEED = PROJECT_ROOT.join('data', 'db_seed.sql')

namespace :db do
  desc 'Populate database with seed data'
  task :seed => :validate_seed do
    db_name = (ENV['APP_DATABASE_URL'] || ENV['DATABASE_URL'])[%r{(?<=/)[^/]+$}]

    system("sed 's/^\\\\c.*/\\\\c #{db_name};/' '#{DB_SEED}'" \
           " | psql #{db_name}")
  end

  desc 'Dependency check for confidential SQL dump file'
  task :validate_seed do
    abort('data/db_seed.sql: file not found') unless DB_SEED.file?
  end
end
