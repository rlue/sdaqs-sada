# frozen_string_literal: true

require 'roda'

class App < Roda
  route do |r|
    r.root do
      'hello'
    end
  end
end

run App.freeze.app
