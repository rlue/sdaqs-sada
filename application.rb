# frozen_string_literal: true

require 'roda'

class SDAQS < Roda
  route do |r|
    r.root do
      'hello'
    end
  end
end
