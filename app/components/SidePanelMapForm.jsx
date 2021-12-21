import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import classNames from 'classnames';
import SearchUnit from './SearchUnit';
import { selectionProgress, historyEntry } from '../utils/globalStateHelper';
import sites from '../../data/sites.json';

export default function SidePanelMapForm({
  userFlow,
  setUserFlow,
  deployments,
  dispatchDeployments,
}) {
  const fuse = useRef(
    new Fuse(Object.values(sites), {
      shouldSort: true,
      threshold: 0.25,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
    }),
  );

  return (
    <div className={classNames('m-4', 'space-y-4')}>
      <ol className="search-list list-decimal pl-6 space-y-4">
        {deployments.map((deployment) => (
          <SearchUnit
            key={deployment.id}
            fuse={fuse.current}
            deployment={deployment}
            {...{
              deployments,
              dispatchDeployments,
              userFlow,
              setUserFlow,
            }}
          />
        ))}
      </ol>
      <div className="flex justify-between">
        <button
          type="button"
          className="btn--secondary"
          onClick={() => {
            const deployment = deployments.find(({ base }) => base.name === 'Baghdad')
              || deployments.slice(-1)[0];

            setUserFlow({ mode: 'map', action: 'tour', deploymentId: deployment.id });
          }}
        >
          Help
        </button>
        <div className="space-x-2">
          <button
            type="button"
            className="btn--secondary"
            onClick={() => {
              dispatchDeployments({ type: 'reset' });
              setUserFlow({ mode: 'map' });
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={selectionProgress(deployments) !== 'complete'}
            className="btn--primary"
            onClick={() => {
              history.pushState(...historyEntry({ mode: 'chart' }));
              setUserFlow({ mode: 'chart' });
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

SidePanelMapForm.propTypes = {
  userFlow: PropTypes.shape({
    mode: PropTypes.string,
    for: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        lat: PropTypes.string,
        lng: PropTypes.string,
      }),
    ),
  }).isRequired,
  setUserFlow: PropTypes.func.isRequired,
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
};
