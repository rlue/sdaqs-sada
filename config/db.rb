# frozen_string_literal: true

require 'sequel/core'

# APP_DATABASE_URL may contain passwords.
# Delete it from the environment so subprocesses can't see it.
DB = Sequel.connect(ENV.delete('APP_DATABASE_URL') || ENV.delete('DATABASE_URL'))
