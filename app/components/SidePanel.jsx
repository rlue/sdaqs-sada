import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import classNames from 'classnames';
import { ChevronLeft, Download } from './Icons';
import SearchUnit from './SearchUnit';
import { selectionProgress, historyEntry } from '../utils/globalStateHelper';
import { exposureMap } from '../utils/chartHelper';
import sites from '../../data/sites.json';

export default function SidePanel({
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

  const [csvSpinner, setCsvSpinner] = useState(false);

  return (
    <div className="side-panel">
      <div className="side-panel__header">
        <h1>SDAQS</h1>
        <button
          type="button"
          className={classNames(
            'side-panel__back-button',
            {
              'side-panel__back-button--shown': userFlow.mode === 'chart',
              'side-panel__back-button--hidden': userFlow.mode === 'map',
            },
          )}
          onClick={() => history.back()}
        >
          <ChevronLeft className="w-3 h-3 m-2" fill="#333" />
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
              onClick={({ target }) => {
                const iframe = document.createElement('iframe');

                iframe.src = `/exposures.csv?${window.location.hash.split('/', 2)[1]}`;
                iframe.onload = () => {
                  setCsvSpinner(false);
                  target.disabled = false;
                  document.body.removeChild(iframe);
                };

                setCsvSpinner(true);
                target.disabled = true;
                document.body.appendChild(iframe);
              }}
            >
              {csvSpinner
                ? <span className="spinner inline-block w-5 h-5 mr-2" />
                : <Download className="inline-block align-text-top w-5 h-5 mr-2" fill="#333" />}
              Export to CSV
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

SidePanel.propTypes = {
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
