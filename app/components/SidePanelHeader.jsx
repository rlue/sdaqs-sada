import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ChevronLeft } from './Icons';

export default function SidePanelHeader({
  userFlow,
}) {
  return (
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
  );
}

SidePanelHeader.propTypes = {
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
};
