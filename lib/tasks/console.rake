# frozen_string_literal: true

desc 'Launch development console'
task :console do
  # Other rake tasks `require ./config/db`,
  # which deletes APP_DATABASE_URL from the environment,
  # but the pry subprocess still needs access to it.
  ENV['APP_DATABASE_URL'] ||= DB.uri if defined?(DB)

  system('bundle exec pry -r ./app/app')
end
task :c => :console
