import React from 'react'
import PropTypes from 'prop-types'
import Combobox from './Combobox'
import sites from '../data/sites.json'

export default function SearchForm({
  searchSuggestions,
  setSearchSuggestions,
  setFocusedSuggestion,
}) {
  return (
    <div className="item__bifold-left">
      <h1>Look up exposure history</h1>
      <form>
        <Combobox
          values={sites}
          {...{ searchSuggestions, setSearchSuggestions, setFocusedSuggestion }}
        />
      </form>
    </div>
  )
}

SearchForm.propTypes = {
  searchSuggestions: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  setSearchSuggestions: PropTypes.func.isRequired,
  setFocusedSuggestion: PropTypes.func.isRequired,
}
