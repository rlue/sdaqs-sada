# frozen_string_literal: true

Sequel.migration do
  up do
    extension :pg_enum

    create_enum(:country, %w[Afghanistan
                             Djibouti
                             Iraq
                             Kuwait
                             Kyrgyzstan
                             Qatar
                             United\ Arab\ Emirates])

    create_table(:military_bases) do
      primary_key :id
      String :name, null: false, index: { unique: true }
      Float :lat, null: false
      Float :lng, null: false
      Country :country, null: false
      String :base_fob_name

      constraint(:lat_range, lat: (-90..90))
      constraint(:lng_range, lng: (-180..180))
    end
  end

  down do
    extension :pg_enum

    drop_table(:military_bases)
    drop_enum(:country)
  end
end
