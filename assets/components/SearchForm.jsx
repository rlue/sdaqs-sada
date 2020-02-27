import React from 'react'
import PropTypes from 'prop-types'
import Combobox from './Combobox'
import sites from '../data/sites.json'

export default function SearchForm({ matches, setMatches }) {
  return (
    <div className="item__bifold-left">
      <h1>Look up exposure history</h1>
      <form>
        <Combobox values={sites} {...{ matches, setMatches }} />
      </form>
    </div>
  )
}

SearchForm.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  setMatches: PropTypes.func.isRequired,
}
