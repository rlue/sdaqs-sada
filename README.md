SDAQS-SADA
==========

This _Source-Differentiated Air Quality System
for Southwest Asia, Djibouti, and Afghanistan_
is an air quality reporting tool built for
[U.S. federal grant 80NSSC19K0225][0].

[TODO: insert screenshot]

Generate a **chart** and **downloadable CSV file** of air contaminant levels
for over 1,600 sites throughout the SADA region,
broken down by week, for any period from 2002 to present.

SDAQS-SADA reports individual concentration levels
for a variety of air contaminant types,
including sulfates, nitrates, elemental carbon, organic carbon, and dust.

### Associated Programs

* **Clinical:** Department of Veterans’ Affairs [CSP #595][1]
* **Research:** Department of Defense [Millennium Cohort Study][2]

Installation
------------

[TODO: write me]

Development
-----------

SDAQS-SADA is built using Roda + React.

### Requirements

* Ruby 2.7.0
* Bundler 2.1.2
* Yarn 2.0.0
* PostgreSQL
* [forego][3]
* [direnv][4] (recommended)

### Configuration

```sh
# .envrc
export RACK_ENV="development"
export APP_DATABASE_URL="postgres:///sdaqs_${RACK_ENV}"
```

### Common Tasks

```sh
# install dependencies
$ bundle install
$ yarn install

# set up database
$ createdb sdaqs_development
$ rake db:migrate
$ rake db:seed

# launch ruby console
$ pry -r ./app/app.rb

# launch in development mode
$ forego start -f Procfile.dev
```

### Fonts

To embed new fonts into this project:

1. [Convert][5] to WOFF/WOFF2 format
2. Save to `public/assets/fonts`
3. Use the [CSS `@font-face` directive][6]

### Linting

This project uses ESLint (with `eslint-plugin-prettier`) for code linting.
The following IDE configurations may be of use.

#### vim + ALE

```vimscript
let g:ale_fix_on_save = 1
let g:ale_javascript_eslint_use_global = 1
let g:ale_javascript_eslint_executable = 'yarn'
let g:ale_javascript_eslint_options = 'run eslint'
let g:ale_fixers = {
\   'javascriptreact': ['eslint'],
\   'javascript': ['eslint'],
\ }
```

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
