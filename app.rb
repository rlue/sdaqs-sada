# frozen_string_literal: true

require 'roda'
require_relative 'config/models'
require 'json'

class App < Roda
  plugin :public

  route do |r|
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
          <div id="app"></div>
          #{JSON.parse(File.read('assets/webpack-assets.json')).values
                .map { |asset| asset['js'] }
                .map { |path| %(<script src="assets/#{path}"></script>) }
                .join("\n")}
        </body>
        </html>
      HTML
    end
  end
end
