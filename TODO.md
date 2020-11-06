### Up Next

* Add error handling to JS fetch logic
* [Style background](https://bgjar.com/?ck_subscriber_id=702982198)
* Fix chart.js hover tracking for multiple datasets covering diff. time
  windows
* Add export-to-CSV functionality
  (DETERMINE: What format should CSV data follow? Which columns are needed?)
* Add screenshot of chart mode to guided tour
* Refactor/rename `validate` & `validatedHashPath` methods
* Create a warning message component to prominently alert users/sysadmin
  when `MAPBOXGL_ACCESS_TOKEN` is absent or invalid.
* Remind user to refresh when a new version is available?
* Add `<title>`
* Add more screenshots to README
* Fix db:seed rake task

#### Chart mode redesign

* Add aggregate figures (average, standard deviation) to charts
* Animate switch from search form to exposure menu
* Rename SearchPanel component
  (because in “chart” mode, it’s not for search)
* Refactor SearchPanel map/chart mode content the React way
  (declaratively rendered, not via shown/hidden CSS classes)
* Add hover animation to buttons

### Blocked

* Build out backend API with sample data
  (Waiting on Ken / Meredith for sample data)
* Limit date picker to available dates
  (Waiting on @chmln to merge flatpickr PR)
* Ditch moment.js
  (depends on replacing antd with flatpickr)
* Move `$MAPBOXGL_ACCESS_TOKEN`
  from `ARG` to BuildKit `--secret`:

  * Pending <https://github.com/docker/compose/pull/7835>
  * <https://pythonspeed.com/articles/build-secrets-docker-compose/>
  * <https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-secret-information>

### Deprioritized

* Configure eslint/prettier (and document usage in README)
* WORKAROUND IMPLEMENTED: update to mapbox-gl v1.9.0+
  (1.9.0 adds support for a “padding” option on flyTo)
  * submit bug report for map fit weirdness from 1.9.0 upgrade
* Tabbing from last (empty) deployment should move focus to Submit
* Fix last step of tour (clicking “submit” should exit)
  ...seems to be fixed now??
* Migrate from PropTypes to TypeScript
