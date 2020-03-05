import React from 'react'
import PropTypes from 'prop-types'
import Combobox from './Combobox'
import sites from '../data/sites.json'

export default function SearchForm({
  deployments,
  dispatchDeployments,
  searchSuggestions,
  setSearchSuggestions,
  setFocusedSuggestion,
}) {
  return (
    <div className="item__bifold-left">
      <h1>Look up exposure history</h1>
      <div>
        {deployments.map((deployment, i) => (
          <div key={deployment.id}>
            <Combobox
              values={sites}
              index={i}
              selection={deployment.base}
              {...{
                dispatchDeployments,
                searchSuggestions,
                setSearchSuggestions,
                setFocusedSuggestion,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

SearchForm.propTypes = {
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
  searchSuggestions: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  setSearchSuggestions: PropTypes.func.isRequired,
  setFocusedSuggestion: PropTypes.func.isRequired,
}
