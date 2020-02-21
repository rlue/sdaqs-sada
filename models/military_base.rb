# frozen_string_literal: true

class MilitaryBase < Sequel::Model
  def validate
    super
    errors.add(:latitude, 'must be between -90 and 90') unless (-90..90).include?(latitude)
    errors.add(:longitude, 'must be between -180 and 180') unless (-180..180).include?(longitude)
  end
end
