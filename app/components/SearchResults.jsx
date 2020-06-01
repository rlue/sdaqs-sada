import React from 'react';
import PropTypes from 'prop-types';

export default function SearchResults({ status, children }) {
  switch (status) {
    case 'debouncing':
      return <li className="px-2 py-1">Searching...</li>;
    case 'no results':
      return <li className="px-2 py-1">No results.</li>;
    case 'success':
      return children;
    default:
      return null;
  }
}

SearchResults.propTypes = {
  status: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
