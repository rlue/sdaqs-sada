import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import { LeftOutlined, SaveFilled } from '@ant-design/icons';
import classNames from 'classnames';
import SearchUnit from './SearchUnit';
import sites from '../../assets/data/sites.json';

export default function SearchPanel({
  userFlow,
  setUserFlow,
  deployments,
  dispatchDeployments,
  setExposureHistory,
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

  function validateDeployments() {
    const initializedDeployments = deployments.filter(({ base }) => base.id);
    const completedDeployments = initializedDeployments.filter(({ period }) => period);

    return initializedDeployments.length
      && initializedDeployments.length === completedDeployments.length;
  }

  return (
    <div className="search-panel">
      <div className="search-panel__header">
        <h1>SDAQS</h1>
        <button
          type="button"
          className={classNames(
            'search-panel__back-button',
            {
              'animate-zoom-enter': userFlow.mode === 'exposure report',
              'animate-zoom-exit': userFlow.mode === 'deployment builder',
            },
          )}
          onClick={() => setUserFlow({ mode: 'deployment builder' })}
        >
          <LeftOutlined />
        </button>
      </div>
      <div
        className={classNames(
          'm-4',
          'space-y-4',
          { hidden: userFlow.mode === 'exposure report' },
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

              setUserFlow({ mode: 'deployment builder', action: 'tour', deploymentId: deployment.id });
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
                setUserFlow({ mode: 'deployment builder' });
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!validateDeployments()}
              className="btn--primary"
              onClick={() => {
                const queryString = deployments.filter((d) => d.base.id && d.period)
                  .map((d) => `${d.base.id}[]=${d.period.map((m) => m.format('YYYY-MM-01')).join(',')}`)
                  .join('&');

                fetch(`/exposures?${queryString}`)
                  .then((response) => response.json())
                  .then(setExposureHistory);

                setUserFlow({ mode: 'exposure report' });
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <div
        className={classNames(
          { hidden: userFlow.mode === 'deployment builder' },
        )}
      >
        <ul>
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            >
              Summary
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            >
              PM2.5
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            >
              PM10
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            >
              Dust
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            >
              Nitrates
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            >
              Sulfates
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            >
              <SaveFilled />
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
  setExposureHistory: PropTypes.func.isRequired,
};
