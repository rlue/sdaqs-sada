import React from 'react'
import PropTypes from 'prop-types'
import Combobox from './Combobox'
import sites from '../../assets/data/sites.json'

export default function SearchForm({
  deployments,
  dispatchDeployments,
  searchResults,
  setSearchResults,
  setFocusedResult,
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
                searchResults,
                setSearchResults,
                setFocusedResult,
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
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  setSearchResults: PropTypes.func.isRequired,
  setFocusedResult: PropTypes.func.isRequired,
}
