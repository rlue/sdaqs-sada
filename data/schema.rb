# This file is solely intended to verify the DB schema
# (via `rake db:verify_schema`).
# It should never need to be executed.
#
# See the README to learn how to prepare the database.
#
Sequel.migration do
  change do
    create_table(:bases) do
      String :base_id, :size=>6, :fixed=>true, :null=>false
      String :base_name, :size=>40
      String :country, :size=>20
      BigDecimal :base_lon
      BigDecimal :base_lat
      Integer :pm_id
      Integer :merra_id

      primary_key [:base_id]
    end

    create_table(:merra) do
      Integer :merra_id, :null=>false
      Date :date, :null=>false
      BigDecimal :bcexttau
      BigDecimal :duexttau
      BigDecimal :ocexttau
      BigDecimal :suexttau
      BigDecimal :totexttau
      BigDecimal :bcsmass
      BigDecimal :dusmass25
      BigDecimal :dusmass
      BigDecimal :ocsmass
      BigDecimal :so4smass
      BigDecimal :sssmass

      primary_key [:merra_id, :date]
    end

    create_table(:pm) do
      Integer :pm_id, :null=>false
      Date :date, :null=>false
      BigDecimal :pm25

      primary_key [:pm_id, :date]
    end
  end
end
