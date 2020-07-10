# frozen_string_literal: true

require 'rubygems'
require 'bundler/setup'
Bundler.require(:default, ENV.fetch('RACK_ENV') { 'production' })

require_relative '../config/models'
require 'json'

class App < Roda
  plugin :public
  plugin :json

  plugin :not_found do
    <<~HTML
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 Not Found</title>
        <meta charset="utf-8" />
        <link rel="stylesheet" href="https://newcss.net/new.min.css">
      </head>
      <body>
        <h1>🤷 404: Nothing to see here!</h1>
      </body>
      </html>
    HTML
  end

  route do |r| # rubocop:disable Metrics/BlockLength
    r.public

    r.root do
      <<~HTML
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <link href='https://api.mapbox.com/mapbox-gl-js/v1.7.0/mapbox-gl.css' rel='stylesheet' />
        </head>
        <body>
          <div id="app" class="fixed inset-0"></div>
          #{JSON.parse(File.read('assets/webpack-assets.json')).values
                .map { |asset| asset['js'] }
                .map { |path| %(<script src="assets/#{path}"></script>) }
                .join("\n")}
        </body>
        </html>
      HTML
    end

    r.get 'exposures' do
      deployment_conditions = r.params.map do |base_id, periods|
        periods.map { |p| <<~SQL.chomp }.join(' OR ')
          (base_id = '#{base_id}' AND
           date >= '#{Date.parse(p.split(',').first)}'::date AND
           date <= '#{Date.parse(p.split(',').last).next_month - 1}'::date)
        SQL
      end.join(' OR ')

      DB[<<~SQL.chomp].all.group_by { |record| record.delete(:base_id) }
        SELECT date, pm25, base_id
        FROM exposures
        LEFT JOIN bases
          ON exposures.pixel_id = bases.pixel_id
        WHERE #{deployment_conditions}
      SQL
    end
  end
end
