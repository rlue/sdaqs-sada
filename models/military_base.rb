# frozen_string_literal: true

class MilitaryBase < Sequel::Model
  def validate
    super
    errors.add(:lat, 'must be between -90 and 90') unless (-90..90).include?(lat)
    errors.add(:lng, 'must be between -180 and 180') unless (-180..180).include?(lng)
  end
end
