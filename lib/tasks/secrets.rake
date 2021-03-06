# frozen_string_literal: true

SITES_JSON = PROJECT_ROOT.join('data', 'sites.json')

namespace :secrets do
  desc 'Generate confidential frontend asset file'
  task :generate => :'db:validate_seed' do
    next if File.exist?(SITES_JSON)

    printf('generating data/sites.json... ')

    # `require './config/db'` deletes APP_DATABASE_URL from the environment,
    # but other rake tasks may launch subprocesses that need it.
    require './config/db'
    ENV['APP_DATABASE_URL'] ||= DB.uri

    DB[<<~SQL.chomp]
      SELECT
        base_id AS id,
        country,
        base_name AS name,
        base_lon AS lng,
        base_lat AS lat
      FROM
        bases
    SQL
      .reduce({}) { |hash, record| hash.merge(record[:id] => record) }
      .then { |site_hash| File.write(SITES_JSON, site_hash.to_json) }

    puts('done!')
  end
  task :g => :generate
end
