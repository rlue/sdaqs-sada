# frozen_string_literal: true

require 'pathname'

DB_SEED = Pathname.new(__dir__).parent.parent.join('data', 'db_seed.sql').freeze

desc 'Deploy live application'
task :deploy do
  abort('data/db_seed.sql: not found') unless File.exist?(DB_SEED)

  system('docker-compose up --detach --build')
end
