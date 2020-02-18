# frozen_string_literal: true

require 'roda'
require_relative 'config/models'

class App < Roda
  route do |r|
    r.root do
      <<~HTML
        <p>
          Lorem ipsum dolor sit amet consectetur
        </p>

        <ol>
          <li>
            And here's a list!
          </li>
          <li>
            It goes on!
          </li>
          <li>
            And on!
          </li>
        </ol>
      HTML
    end
  end
end
