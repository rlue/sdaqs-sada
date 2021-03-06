// Returns a query string for a given array of deployments.
//
//     [
//       {
//         id: ...,
//         base: { id: 'VA0518', ... },
//         period: [<2018-01-01>, <2018-02-01>],
//       },
//       {
//         id: ...,
//         base: { id: 'VA1260', ... },
//         period: [<2018-03-01>, <2018-06-01>],
//       },
//     ]
//
//  returns
//
//     VA0518[]=2018-01-01,2018-02-01&VA1260[]=2018-03-01,2018-06-01
//
// Resulting format is suitable for
// both query strings (`?...`) and fragment (hash) parameters (`#...`).
export function exposureQuery(deployments, options = { strict: true }) {
  function dateToString(date) {
    return date instanceof Date
      ? [
          date.getFullYear(),
          `0${date.getMonth() + 1}`.slice(-2), // add leading zero
          `0${date.getDate()}`.slice(-2), // add leading zero
        ].join('-')
      : ''
  }

  return deployments
    .filter((d) => d.base.id && (d.period || !options.strict))
    .map((d) => `${d.base.id}[]=${d.period?.map(dateToString).join(',') || ''}`)
    .join('&');
}

// URL fragment parsing --------------------------------------------------------
//
// Parses a URL fragment (the specifier after `#`)
// into two components (both optional):
//
//     https://host/#foo/bar/baz=qux&quux=quuz
//                   ^^^^^^^ ^^^^^^^^^^^^^^^^^
//                pseudopath      param string
//
const FRAGMENT_REGEX = new RegExp(
  '^#?'
  + '(.*?)' // CAPTURE GROUP 1: pseudopath (or, non-greedy everything-but-the-param-string)
  + '/?' // trailing slash is optional when param string is absent
  + '([^/]+=.*)?$' // CAPTURE GROUP 2: param string
);

// Parses param strings.
//
// With "https://host/path#foo=bar&baz[]=qux&baz[]=quux",
// returns `{ foo: 'bar', baz: ['qux', 'quux'] }`.
export function hashParams() {
  return (window.location.hash.match(FRAGMENT_REGEX)[2] || '')
    .split('&')
    .reduce((params, param) => {
      let [key, value] = param.split('=');

      if (value === undefined) {
        // param invalid - do nothing
      } else if (key.endsWith('[]')) {
        key = key.slice(0, -2);

        params[key] = params[key] || [];
        params[key].push(value);
      } else {
        params[key] = value;
      }

      return params;
    }, {});
}

// Returns the full pseudopath.
//
// With "https://host/#foo/bar/baz=qux",
// returns "foo/bar".
export function hashPath() {
  return window.location.hash.match(FRAGMENT_REGEX)[1];
}
