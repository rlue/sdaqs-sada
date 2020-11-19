# frozen_string_literal: true

require 'rubygems'
require 'bundler/setup'
Bundler.require(:default, ENV.fetch('RACK_ENV') { 'production' })

require_relative '../config/models'
require 'json'

CONTAMINANTS = (Exposure.columns - %i[pixel_id date]).freeze
AGGREGATE_FUNCTIONS = %i[stddev avg].freeze

class App < Roda
  plugin :public
  plugin :json
  plugin :symbol_status

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
          <title>SDAQS | Historical Air Quality Data for the SADA Region</title>
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
      records = Exposure.at(**deployment_conditions(r.params))
        .select { Exposure.columns + Base.columns - [:pixel_id] }
        .map(&:values)

      CONTAMINANTS.each.with_object({}) do |c, hash|
        records.each do |record|
          hash[c] ||= {}
          hash[c][record[:base_id]] ||= {}
          hash[c][record[:base_id]][record[:date]] = record[c]
        end
      end
    rescue ArgumentError, Sequel::Error => e
      case e.message
      when 'invalid query', 'The OR operator requires at least 1 argument'
        response.status = :bad_request
        response['X-Error-Message'] = 'invalid query'
      else
        raise
      end
    end

    r.get 'exposure_stats' do
      stats = Exposure.at(**deployment_conditions(r.params))
        .select do
          AGGREGATE_FUNCTIONS.product(CONTAMINANTS)
            .map { |func, c| Sequel.function(func, c).as("#{c}_#{func}") }
        end.map(&:values).first

      CONTAMINANTS.each.with_object({}) do |c, hash|
        AGGREGATE_FUNCTIONS.each do |func|
          hash[c] ||= {}
          hash[c][func] = stats[:"#{c}_#{func}"]
        end
      end
    rescue ArgumentError, Sequel::Error => e
      case e.message
      when 'invalid query', 'The OR operator requires at least 1 argument'
        response.status = :bad_request
        response['X-Error-Message'] = 'invalid query'
      else
        raise
      end
    end

    r.get 'exposures.csv' do
      Exposure.at(**deployment_conditions(r.params))
        .select(*(Exposure.columns - [:pixel_id] + %i[base_id base_name]))
        .to_csv.tap { response['Content-Type'] = 'text/csv' }
    rescue ArgumentError, Sequel::Error => e
      case e.message
      when 'invalid query', 'The OR operator requires at least 1 argument'
        response.status = :bad_request
        response['X-Error-Message'] = 'invalid query'
      else
        raise
      end
    end
  end

  def deployment_conditions(params)
    params.transform_values do |periods|
      periods.map do |period|
        Range.new(*period.split(',').map(&Date.method(:parse)))
      end
    end
  rescue NoMethodError, Date::Error => e
    raise unless e.message.match?(/(undefined method `map'|invalid date)/)

    raise ArgumentError, 'invalid query'
  end
end
