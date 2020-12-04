### Up Next

#### Chart mode redesign

* Add aggregate figures (average, standard deviation) to charts
* Animate switch from search form to exposure menu
* Rename SearchPanel component
  (because in “chart” mode, it’s not for search)
* Refactor SearchPanel map/chart mode content the React way
  (declaratively rendered, not via shown/hidden CSS classes)
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

* Validate string value of `userFlow.contaminant`
* Configure eslint/prettier (and document usage in README)
* WORKAROUND IMPLEMENTED: update to mapbox-gl v1.9.0+
  (1.9.0 adds support for a “padding” option on flyTo)
  * submit bug report for map fit weirdness from 1.9.0 upgrade
* Tabbing from last (empty) deployment should move focus to Submit
  (set `tabindex="-1"` for date picker when preceding search box is empty)
* Migrate from PropTypes to TypeScript
* Find a better way to test Mapbox access token validity than `fetch('<endpoint>')`
