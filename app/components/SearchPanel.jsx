import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import { LeftOutlined, DownloadOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import SearchUnit from './SearchUnit';
import { selectionProgress, historyEntry } from '../utils/globalStateHelper';
import { exposureMap } from '../utils/chartHelper';
import sites from '../../data/sites.json';

export default function SearchPanel({
  userFlow,
  setUserFlow,
  deployments,
  dispatchDeployments,
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
  );

  return (
    <div className="search-panel">
      <div className="search-panel__header">
        <h1>SDAQS</h1>
        <button
          type="button"
          className={classNames(
            'search-panel__back-button',
            {
              'search-panel__back-button--shown': userFlow.mode === 'chart',
              'search-panel__back-button--hidden': userFlow.mode === 'map',
            },
          )}
          onClick={() => history.back()}
        >
          <LeftOutlined />
        </button>
      </div>
      <div
        className={classNames(
          'm-4',
          'space-y-4',
          { hidden: userFlow.mode === 'chart' },
        )}
      >
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
      <div
        className={classNames(
          { hidden: userFlow.mode === 'map' },
        )}
      >
        <ul>
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
              onClick={() => setUserFlow({ mode: 'chart' })}
            >
              Summary
            </button>
          </li>
          {Object.entries(exposureMap).map(([contaminant, { name }]) =>
            <li key={contaminant}>
              <button
                type="button"
                className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
                onClick={() => setUserFlow({ mode: 'chart', contaminant })}
              >
                {name}
              </button>
            </li>
          )}
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
              onClick={() => window.location.href = `/exposures.csv?${window.location.hash.split('/', 2)[1]}`}
            >
              <DownloadOutlined />
              {' '}
              Export to CSV
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

SearchPanel.propTypes = {
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
