import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import classNames from 'classnames';
import SearchUnit from './SearchUnit';
import sites from '../../assets/data/sites.json';

export default function SearchPanel({
  uiFocus,
  setUIFocus,
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
      </div>
      <ol className="search-list list-decimal m-4 pl-6 space-y-4">
        {deployments.map((deployment) => (
          <SearchUnit
            key={deployment.id}
            fuse={fuse.current}
            deployment={deployment}
            {...{
              dispatchDeployments,
              uiFocus,
              setUIFocus,
            }}
          />
        ))}
      </ol>
      <div className="m-4 flex justify-between">
        <button
          type="button"
          className={classNames(
            'text-indigo-700',
            'border',
            'border-transparent',
            'hover:border-indigo-700',
            'focus:border-indigo-700',
            'py-2',
            'px-4',
            'rounded',
          )}
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
            className={classNames(
              'text-indigo-700',
              'border',
              'border-transparent',
              'hover:border-indigo-700',
              'focus:border-indigo-700',
              'py-2',
              'px-4',
              'rounded',
            )}
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
            className={classNames(
              'bg-indigo-700',
              'hover:bg-indigo-900',
              'focus:bg-indigo-900',
              'text-white',
              'font-bold',
              'py-2',
              'px-4',
              'rounded',
              'disabled:opacity-50',
              'disabled:cursor-not-allowed',
            )}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

SearchPanel.propTypes = {
  uiFocus: PropTypes.shape({
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
  setUIFocus: PropTypes.func.isRequired,
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
};
