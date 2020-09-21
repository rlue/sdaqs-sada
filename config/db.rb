# frozen_string_literal: true

require 'sequel/core'

# APP_DATABASE_URL may contain passwords.
# Delete it from the environment so subprocesses can't see it.
db_url = ENV.delete('APP_DATABASE_URL') || ENV.delete('DATABASE_URL')
retry_count = 5
retry_wait = 10

retry_count.times do |i|
  DB = Sequel.connect(db_url)
  break
rescue Sequel::DatabaseConnectionError
  raise if i + 1 == retry_count

  $stdout.puts('DB connection failed. Retrying...')
  sleep(retry_wait)
end
