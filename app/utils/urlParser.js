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
