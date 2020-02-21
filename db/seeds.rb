# frozen_string_literal: true

require 'csv'

csv_file = Pathname.new(__dir__).join('seed_data/military_bases.csv')
mb_columns = MilitaryBase.columns.map(&:to_s)

CSV.parse(File.read(csv_file), headers: true).each do |row|
  MilitaryBase.create(row.to_h.slice(*mb_columns))
rescue Sequel::ValidationFailed => e
  LOGGER.debug(e.message)
end
