import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'
import Combobox from './Combobox'
import sites from '../../assets/data/sites.json'

export default function SearchForm({
  deployments,
  dispatchDeployments,
  searchResults,
  setSearchResults,
  setFocusedResult,
  setPrompt,
}) {
  const fuse = useRef(
    new Fuse(sites, {
      shouldSort: true,
      threshold: 0.25,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
    }),
  )

  return (
    <div className="item__bifold-left">
      <h1>Look up exposure history</h1>
      <div>
        {deployments.map((deployment) => (
          <div key={deployment.id}>
            <Combobox
              fuse={fuse.current}
              deployment={deployment}
              {...{
                dispatchDeployments,
                searchResults,
                setSearchResults,
                setFocusedResult,
                setPrompt,
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
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      lat: PropTypes.string.isRequired,
      lng: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  setSearchResults: PropTypes.func.isRequired,
  setFocusedResult: PropTypes.func.isRequired,
  setPrompt: PropTypes.func.isRequired,
}
