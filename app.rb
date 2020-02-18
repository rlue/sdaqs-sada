# frozen_string_literal: true

require_relative 'models'
require 'roda'

class App < Roda
  route do |r|
    r.root do
      'hellewww!'
    end
  end
end
