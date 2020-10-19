import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
import ExposureSummary from './ExposureSummary';

function title(exposureHistory) {
  const firstQueriedBase = Object.keys(exposureHistory)[0];
  const queriedBaseCount = Object.keys(exposureHistory).length;

  switch (queriedBaseCount) {
    case 0:
      return '';
    case 1:
      return firstQueriedBase;
    case 2:
      return `${firstQueriedBase} and 1 other`;
    default:
      return `${firstQueriedBase} and ${queriedBaseCount - 1} others`;
  }
}

function subtitle(exposureHistory) {
  const perDeploymentDateBounds = Object.values(exposureHistory)
    .map((deploymentDays) =>
      [deploymentDays[0], ...deploymentDays.slice(-1)]
        .map(({ date }) => date.split('-'))
        .map(([year, month, day]) => new Date(year, month - 1, day))
    ).flat()

  if (!perDeploymentDateBounds.length) return '';

  const overallDateBounds = [
    new Date(Math.min(...perDeploymentDateBounds)),
    new Date(Math.max(...perDeploymentDateBounds)),
  ]

  const humanizeDate = (date) =>
    date.toLocaleString(
      'en-US',
      { year: 'numeric', month: 'short' },
    );

  return overallDateBounds.map(humanizeDate).join(' to ');
}

export default function ChartPage({ exposureHistory, userFlow }) {
  return (
    <div className="exposure-container flex w-screen min-h-screen overflow-x-hidden">
      <div className="exposure-shim" />
      <div className="flex-grow m-8">
        <h1 className="text-5xl leading-normal">{title(exposureHistory)}</h1>
        <h2 className="text-3xl leading-normal">{subtitle(exposureHistory)}</h2>
        <div className="my-4">
          {userFlow.contaminant
            ? <Chart contaminant={userFlow.contaminant} {...{ exposureHistory }} />
            : <ExposureSummary {...{ exposureHistory }} />
          }
        </div>
      </div>
    </div>
  );
}

ChartPage.propTypes = {
  exposureHistory: PropTypes.objectOf( // key: <baseId> (e.g., VA0518)
    PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        pm25: PropTypes.string.isRequired,
      }).isRequired,
    ),
  ).isRequired,
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
    contaminant: PropTypes.string,
  }).isRequired,
};
