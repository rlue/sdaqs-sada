### Up Next

* Add option to set granularity of air quality results
* Build out backend API with Ken’s sample data
* How will the chart of air quality stats be presented to the user?
* How will mapbox-gl API keys be handled in production?
* How will the app be served for client demo, if not on Heroku?
* ⚠️ Tailwind is not purging unused styles
  because no template paths have been provided.
  If you have manually configured PurgeCSS outside of Tailwind
  or are deliberately not removing unused styles,
  set `purge: false` in your Tailwind config file
  to silence this warning.

  https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
* Add favicon

### Deprioritized

* WORKAROUND IMPLEMENTED: update to mapbox-gl v1.9.0+
  (1.9.0 adds support for a “padding” option on flyTo)
  * submit bug report for map fit weirdness from 1.9.0 upgrade
* Tabbing from last (empty) deployment should move focus to Submit
