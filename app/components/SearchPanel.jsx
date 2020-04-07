import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'
import SearchUnit from './SearchUnit'
import sites from '../../assets/data/sites.json'

export default function SearchPanel({
  deployments,
  dispatchDeployments,
  setFocusedResult,
  prompt,
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
          <SearchUnit
            key={deployment.id}
            fuse={fuse.current}
            deployment={deployment}
            {...{
              dispatchDeployments,
              setFocusedResult,
              prompt,
              setPrompt,
            }}
          />
        ))}
      </div>
    </div>
  )
}

SearchPanel.propTypes = {
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
  setFocusedResult: PropTypes.func.isRequired,
  prompt: PropTypes.shape({
    for: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        lat: PropTypes.string,
        lng: PropTypes.string,
      }),
    ),
  }).isRequired,
  setPrompt: PropTypes.func.isRequired,
}
