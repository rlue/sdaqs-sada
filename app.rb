# frozen_string_literal: true

require 'roda'
require_relative 'config/models'

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
        </head>
          <body>
          <div id="app"></div>
          <script src="assets/index.js"></script>
        </body>
        </html>
      HTML
    end
  end
end
