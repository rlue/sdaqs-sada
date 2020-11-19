# frozen_string_literal: true

class Exposure < Sequel::Model
  one_to_many :bases, class: :Base, primary_key: :pixel_id, key: :pixel_id

  dataset_module do
    def at(**deployments)
      association_left_join(:bases)
        .where do
          Sequel.|(*deployments.map do |base_id, periods|
            Sequel.&(
              { base_id: base_id.to_s },
              Sequel.|(*periods.map { |period| { date: period } })
            )
          end)
        end
    end
  end
end
