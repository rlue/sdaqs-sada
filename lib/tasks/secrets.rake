# frozen_string_literal: true

require './config/db'

SITES_JSON = PROJECT_ROOT.join('data', 'sites.json')

namespace :secrets do
  desc 'Generate confidential frontend asset file'
  task :generate => :'db:validate_seed' do
    File.write(SITES_JSON, DB[<<~SQL.chomp].all.to_json)
      SELECT
        base_id AS id,
        base_name AS name,
        country
      FROM
        bases
    SQL
  end
  task :g => :generate
end
