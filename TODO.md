### Up Next


#### Chart mode redesign

* Feature idea: colorize aggregate figures on summary page to indicate
  danger/severity of results?

* Split up aggregate figures on a per-deployment basis

  🤔 Separate “tabs” with aggregate figures for each deployment,
  or all on one page in tabular format?

* Add aggregate figures (average, standard deviation) to charts

  🤔 average/stddev across all deployments, or per-base?
  What happens for multiple deployments at same base?

* Add hover animation to buttons
* Add screenshots to README & guided tour

### Blocked

* Replace antd RangePicker with flatpickr

  * Pending <https://github.com/flatpickr/flatpickr/pull/2297>
  * Limit date picker to available dates
  * Ditch moment.js

* Move `$MAPBOXGL_ACCESS_TOKEN`
  from `ARG` to BuildKit `--secret`:

  * Pending <https://github.com/docker/compose/pull/7835>
  * <https://pythonspeed.com/articles/build-secrets-docker-compose/>
  * <https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-secret-information>

### Deprioritized

* Rethink how to pull `db_seed.sql` in post-receive deployment hook
* Generate fake sample data for public demo version
* Validate string value of `userFlow.contaminant`
* Configure eslint/prettier (and document usage in README)
* WORKAROUND IMPLEMENTED: update to mapbox-gl v1.9.0+
  (1.9.0 adds support for a “padding” option on flyTo)
  * submit bug report for map fit weirdness from 1.9.0 upgrade
* Tabbing from last (empty) deployment should move focus to Submit
  (set `tabindex="-1"` for date picker when preceding search box is empty)
* Migrate from PropTypes to TypeScript
* Find a better way to test Mapbox access token validity than `fetch('<endpoint>')`
* Animate switch from search form to exposure menu
