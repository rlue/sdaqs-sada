# frozen_string_literal: true

class Base < Sequel::Model
  CONTAMINANTS = (
    DB.schema(:pm).map(&:first) +
      DB.schema(:merra).map(&:first) -
      %i[pm_id merra_id date]
  ).freeze

  dataset_module do
    def exposures(**deployments)
      left_join(:pm, pm_id: :pm_id).left_join(Sequel.lit(<<~SQL.chomp))
        merra ON ("merra"."merra_id" = "bases"."merra_id"
                  AND ("merra"."date" = "pm"."date" OR "merra"."date" IS NULL))
      SQL
        .where do
          Sequel.|(*deployments.map do |base_id, periods|
            Sequel.&(
              { base_id: base_id.to_s },
              Sequel.|(*periods.map { |period| Sequel.lit(<<~SQL.chomp, *period.minmax) })
                ("pm"."date" >= ? AND "pm"."date" <= ?)
              SQL
            )
          end)
        end
    end
  end
end
