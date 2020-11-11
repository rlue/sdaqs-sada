# frozen_string_literal: true

class Base < Sequel::Model
  one_to_many :exposures, primary_key: :pixel_id, key: :pixel_id
end
