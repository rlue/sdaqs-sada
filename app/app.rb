# frozen_string_literal: true

require 'rubygems'
require 'bundler/setup'
Bundler.require(:default, ENV.fetch('RACK_ENV') { 'production' })

require_relative '../config/initializers'
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
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
          <link rel="manifest" href="/site.webmanifest">
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
          <meta name="msapplication-TileColor" content="#da532c">
          <meta name="theme-color" content="#ffffff">
        </head>
        <body>
          <div class="app-root fixed inset-0 overflow-hidden"></div>
          #{JSON.parse(File.read('assets/webpack-assets.json')).values
                .map { |asset| asset['js'] }
                .map { |path| %(<script src="assets/#{path}"></script>) }
                .join("\n")}
        </body>
        </html>
      HTML
    end

    r.get 'exposures' do
      query = "\n  " + SQL_FORMATTER.format(<<~SQL.chomp)
        SELECT base_id, base_name, date, pm25
        FROM exposures
          LEFT JOIN bases ON exposures.pixel_id = bases.pixel_id
        WHERE #{deployment_conditions(r.params)}
      SQL

      DB[query].all.group_by { |record| record.delete(:base_id) }
    end
  end

  def deployment_conditions(params)
    params.map { |base_id, periods| <<~BASE }.join(' OR ')
      (base_id = '#{base_id}'
        AND (#{periods.map { |p| <<~PERIOD }.join(' OR ')}))
          date BETWEEN '#{p.split(',').first}' AND '#{p.split(',').last}'
        PERIOD
    BASE
  end
end
