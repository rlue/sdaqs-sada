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

Requires Docker Compose.

```sh
# first, copy the requisite sensitive data into the repo
$ mv path/to/sites.json data/
$ mv path/to/db_seed.sql data/

# then, deploy (or update/re-deploy)
$ export MAPBOXGL_ACCESS_TOKEN="pk.eyJ1Ijoicmx..."  # see Security Notice
$ docker-compose up -d --build
```

The resulting container will expose the service at <http://localhost:9292>.

Deploying to the public Internet and enabling HTTPS
are beyond the scope of this README.
For help with these tasks,
consider a reverse proxy or edge router like [traefik][].

### Security Notice

This application requires a Mapbox access token.
Get one at <https://account.mapbox.com>.

Deploying this application will expose this token
to anyone who can access the site—it’s not shown in the open,
but a determined attacker shouldn’t have a hard time finding it.

Typically, that’s Not a Good Thing,
since anyone who obtains your token can use it in their own software
and eat into your monthly usage allowance
(or worse yet, rack up a big bill on a pay-as-you-go plan).
But in this case, it’s just a necessary consequence
of using a JavaScript library ([Mapbox GL JS][]) to access a third-party API:
the client-side application can’t query for map data without the token,
so it must be present in the compiled JS file.

Fortunately, Mapbox has a generous free tier,
so the likelihood of abuse is low.
For more on access token best practices,
read [How to use Mapbox securely][].

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
export NODE_ENV="development"
export APP_DATABASE_URL="postgres:///sdaqs_${RACK_ENV}"
export MAPBOXGL_ACCESS_TOKEN="pk.eyJ1Ijoicmx..." # get one at account.mapbox.com
```

### Installing secrets

This application contains and uses data which may not be published in the open,
such as the lat/lng coordinates of US military bases throughout the SADA region.

In order to run the development server,
you will need to obtain the following:

* `sites.json` is used by the front end (React SPA)
  to populate the results in the search bar
  and translate selections to pins on the map.

  Without it, the frontend application will fail to compile
  (_i.e.,_ `npm run build` and `npx webpack-dev-server` will fail).

* `db_seed.sql` is a SQL dump of the contaminant exposure data
  that this application provides an interface to.

  Without it, database queries made by the backend application will be empty,
  and the charts presented in the frontend application will contain no data.

```sh
$ mv path/to/sites.json data/
$ mv path/to/db_seed.sql data/

# set up database
$ createdb sdaqs_development
$ rake db:migrate
$ rake db:seed
```

### Common Tasks

```sh
# install dependencies
$ bundle install
$ npm install

# launch ruby console
$ rake console  # or rake c

# launch in development mode
$ rake server   # or rake s
```

### Fonts

To embed new fonts into this project:

1. [Convert][5] to WOFF/WOFF2 format
2. Save to `public/assets/fonts`
3. Use the [CSS `@font-face` directive][6]

### Git Commit Message Codes

This repo follows a pattern for git commit messages
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
[traefik]: https://docs.traefik.io
[Mapbox GL JS]: https://docs.mapbox.com/mapbox-gl-js/overview/
[How to use Mapbox securely]: https://docs.mapbox.com/help/troubleshooting/how-to-use-mapbox-securely/
