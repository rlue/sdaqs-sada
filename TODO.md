### Up Next

* Add aggregate figures (average, standard deviation) to charts
* Animate switch from search form to exposure menu
* Rename SearchPanel component
  (because in “chart” mode, it’s not for search)
* Refactor SearchPanel map/chart mode content the React way
  (declaratively rendered, not via shown/hidden CSS classes)
* How will mapbox-gl API keys be handled in production?
* Add error handling to JS fetch logic
* Add hover animation to buttons
* [Style background](https://bgjar.com/?ck_subscriber_id=702982198)
* Fix chart.js hover tracking for multiple datasets covering diff. time
  windows
* Link application state to browser history / URLs
  (`Submit` should push permalinks of app state to browser history)

### Blocked

* Build out backend API with sample data
  (Waiting on Ken / Meredith for sample data)
* Limit date picker to available dates
  (Waiting on @chmln to merge flatpickr PR)
* Ditch moment.js
  (depends on replacing antd with flatpickr)

### Deprioritized

* WORKAROUND IMPLEMENTED: update to mapbox-gl v1.9.0+
  (1.9.0 adds support for a “padding” option on flyTo)
  * submit bug report for map fit weirdness from 1.9.0 upgrade
* Tabbing from last (empty) deployment should move focus to Submit
* Fix last step of tour (clicking “submit” should exit)
  ...seems to be fixed now??
