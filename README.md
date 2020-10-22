SDAQS-SADA
==========

This _Source-Differentiated Air Quality System
for Southwest Asia, Djibouti, and Afghanistan_
is an air quality reporting tool built for
[U.S. federal grant 80NSSC19K0225][0].

[TODO: insert screenshot]

Generate a **chart** and **downloadable CSV file** of air contaminant levels
for over 1,600 sites throughout the SADA region,
broken down by month, for any period from 2002 to present.

SDAQS-SADA reports individual concentration levels
for a variety of air contaminant types,
including sulfates, nitrates, elemental carbon, organic carbon, and dust.

### Associated Programs

* **Clinical:** Department of Veterans’ Affairs [CSP #595][1]
* **Research:** Department of Defense [Millennium Cohort Study][2]

Deployment
----------

```sh
$ export MAPBOXGL_ACCESS_TOKEN="pk.eyJ1Ijoicmx..." # get one at account.mapbox.com
$ docker-compose up -d
```

### Notes

* The resulting container will expose the service at <http://localhost:9292>.

  Deploying to the public Internet and enabling HTTPS
  are beyond the scope of this README.
  For help with these tasks,
  consider a reverse proxy or edge router like [traefik](https://docs.traefik.io).

* The `docker-compose.yml` file bundled in this repo contains some keys
  which relate solely to configuration for the production instance at
  <https://airquality.ryanlue.com>.

  These keys (`labels` and `networks`) may be safely removed
  prior to deployment on any other server.

### Requirements

* Docker Engine 1.13.0+
* Docker Compose

Development
-----------

SDAQS-SADA is built using Roda + React.

### Requirements

* Ruby 2.7.0
* Bundler 2.1.2
* npm 6.0+
* PostgreSQL
* [forego][3]
* [direnv][4] (recommended)

### Configuration

```sh
# .envrc (for direnv)
export RACK_ENV="development"
export APP_DATABASE_URL="postgres:///sdaqs_${RACK_ENV}"
export MAPBOXGL_ACCESS_TOKEN="pk.eyJ1Ijoicmx..." # get one at account.mapbox.com
```

### Common Tasks

```sh
# install dependencies
$ bundle install
$ npm install

# set up database
$ createdb sdaqs_development
$ rake db:migrate
$ rake db:seed

$ rake console  # launch ruby console
$ rake server   # launch in development mode
```

### Fonts

To embed new fonts into this project:

1. [Convert][5] to WOFF/WOFF2 format
2. Save to `public/assets/fonts`
3. Use the [CSS `@font-face` directive][6]

### Git Commit Message Codes

This repo establishes a pattern for git commit messages
inspired by [the one used on AngularJS][7].

The first line of each commit should begin
with one of the following three-letter codes:

* `bfx`: Bugfix
* `chr`: Chore (deprecated, try `dev` or `dep`)
* `dep`: Dependency (_i.e.,_ Bundler/npm files)
* `dev`: Developer Concerns (notes, tooling, file structure, etc.)
* `doc`: Documentation
* `dpl`: Deployment
* `ftr`: Feature
* `rfg`: Refactoring
* `tdd`: Testing
* `uix`: UI/UX
* `vis`: Visual Design

License
-------

Copyright © 2020 University of Southern California. All rights reserved.

[0]: https://govtribe.com/award/federal-contract-award/grant-for-research-80nssc19k0225
[1]: https://www.vacsp.research.va.gov/CSPEC/Studies/INVESTD-R/CSP-595-SHADE.asp
[2]: https://www.millenniumcohort.org/
[3]: https://github.com/ddollar/forego/releases
[4]: https://github.com/direnv/direnv
[5]: https://www.fontsquirrel.com/tools/webfont-generator
[6]: https://css-tricks.com/snippets/css/using-font-face/
[7]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y
