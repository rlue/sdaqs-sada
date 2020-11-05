# frozen_string_literal: true

# This dev/prod distinction is not strictly necessary
# since DB queries are not logged in production.
#
# If DB logging is enabled in production in the future,
# this will keep output compact.
case ENV['RACK_ENV']
when 'development', 'test'
  require 'anbt-sql-formatter/formatter'

  AnbtSql::Constants::SQL_RESERVED_WORDS.delete('DATE')

  SQL_FORMATTER = AnbtSql::Rule.new
    .tap { |rule| rule.function_names += %w[COUNT AVG STDDEV] }
    .tap { |rule| rule.indent_string = '  ' }
    .tap { |rule| rule.space_after_comma = true }
    .then { |rule| AnbtSql::Formatter.new(rule) }
else
  require 'active_support/core_ext/string'

  class SqlFormatter
    def format(raw_sql)
      raw_sql.squish
    end
  end

  SQL_FORMATTER = SqlFormatter.new
end
