import React from 'react'
import PropTypes from 'prop-types'

export default function SearchResults({ status, children }) {
  switch (status) {
    case 'debouncing':
      return <li>Searching...</li>
    case 'no results':
      return <li>No results.</li>
    case 'success':
      return children
    default:
      return null
  }
}

SearchResults.propTypes = {
  status: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}
