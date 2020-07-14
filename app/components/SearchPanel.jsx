import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import { LeftOutlined, SaveFilled } from '@ant-design/icons';
import SearchUnit from './SearchUnit';
import sites from '../../assets/data/sites.json';

export default function SearchPanel({
  uiFocus,
  setUIFocus,
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
    <div id="search-panel">
      <div className="search-panel__header">
        <h1>SDAQS</h1>
        <button
          type="button"
          className="back-button"
          onClick={() => {
            document.querySelector('.content-window').classList.remove('slide-left');
            document.querySelector('.content-window').classList.add('slide-right');
            document.querySelector('.back-button').classList.remove('zoom-enter');
            document.querySelector('.back-button').classList.add('zoom-exit');
            document.querySelector('.search-form').classList.remove('hidden');
            document.querySelector('.exposure-menu').classList.add('hidden');
          }}
        >
          <LeftOutlined />
        </button>
      </div>
      <div className="search-form m-4 space-y-4">
        <ol className="search-list list-decimal pl-6 space-y-4">
          {deployments.map((deployment) => (
            <SearchUnit
              key={deployment.id}
              fuse={fuse.current}
              deployment={deployment}
              {...{
                deployments,
                dispatchDeployments,
                uiFocus,
                setUIFocus,
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

              setUIFocus({ on: 'tour', id: deployment.id });
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
                setUIFocus({});
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

                document.querySelector('.content-window').classList.remove('slide-right');
                document.querySelector('.content-window').classList.add('slide-left');
                document.querySelector('.back-button').classList.remove('zoom-exit');
                document.querySelector('.back-button').classList.add('zoom-enter');
                document.querySelector('.search-form').classList.add('hidden');
                document.querySelector('.exposure-menu').classList.remove('hidden');
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <div className="exposure-menu hidden">
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
              VOCs
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
  uiFocus: PropTypes.shape({
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
  setUIFocus: PropTypes.func.isRequired,
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
  setExposureHistory: PropTypes.func.isRequired,
};
