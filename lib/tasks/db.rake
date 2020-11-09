# frozen_string_literal: true

require 'pathname'
require './config/db'

PROJECT_ROOT = Pathname.new(__dir__).parent.parent
DB_SEED = PROJECT_ROOT.join('data', 'db_seed.sql')
DB_NAME = DB.uri[%r{(?<=/)[^/]+$}]

namespace :db do
  desc 'Populate database with seed data'
  task :seed => :validate_seed do
    system("sed 's/^\\\\c.*/\\\\c #{DB_NAME};/' '#{DB_SEED}'" \
           " | psql #{DB_NAME}")
  end

  desc 'Dependency check for confidential SQL dump file'
  task :validate_seed do
    abort('data/db_seed.sql: file not found') unless DB_SEED.file?
  end
end
