# frozen_string_literal: true

require 'pathname'

PROJECT_ROOT = Pathname.new(__dir__).parent.parent
DB_SEED = PROJECT_ROOT.join('data', 'db_seed.sql')
DB_SCHEMA = PROJECT_ROOT.join('data', 'schema.rb')

namespace :db do
  desc 'Populate database with seed data'
  task :seed => :validate_seed do
    (ENV['APP_DATABASE_URL'] || ENV['DATABASE_URL'])
      .then { |url| url[%r{(?<=/)[^/]+$}] }
      .then { |db_name| system("cat '#{DB_SEED}' | psql #{db_name}") }
  end

  desc 'Check validity of seeded database'
  task :verify_schema do
    require './config/db'
    DB.extension(:schema_dumper)

    current_schema = DB.dump_schema_migration.gsub(/[^\S\r\n]+$/, '') # trim non-newline whitespace

    if current_schema == File.readlines(DB_SCHEMA).reject { |l| l.start_with?('#') }.join
      puts('DB schema OK')
    else
      abort(<<~ERR.chomp)
        data/db_seed.sql: schema invalid
        Are you using the most recent version of the seed file?
      ERR
    end
  end

  desc 'Dependency check for confidential SQL dump file'
  task :validate_seed do
    abort('data/db_seed.sql: file not found') unless DB_SEED.file?
  end
end
