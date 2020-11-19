import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
import ExposureSummary from './ExposureSummary';
import sites from '../../data/sites.json';

function title(exposures) {
  const queriedBases = Object.values(exposures)
    .map(Object.keys).flat()
    .filter((value, index, self) => self.indexOf(value) === index) // .uniq

  const firstQueriedBase = sites.find(({ id }) => queriedBases[0] === id)?.name

  switch (queriedBases.length) {
    case 0:
      return '';
    case 1:
      return firstQueriedBase;
    case 2:
      return `${firstQueriedBase} and 1 other`;
    default:
      return `${firstQueriedBase} and ${queriedBases.length - 1} others`;
  }
}

function subtitle(exposures) {
  const queriedDates = Object.values(exposures)
    .map(Object.values).flat()
    .map(Object.keys).flat()
    .sort()

  if (!queriedDates.length) return '';

  const overallDateBounds = [
    new Date(queriedDates[0]),
    new Date(queriedDates.slice(-1)[0]),
  ]

  const humanizeDate = (date) =>
    date.toLocaleString(
      'en-US',
      { year: 'numeric', month: 'short' },
    );

  return overallDateBounds.map(humanizeDate).join(' to ');
}

export default function ChartPage({ exposures, userFlow }) {
  return (
    <div className="exposure-container flex w-screen min-h-screen overflow-x-hidden">
      <div className="exposure-shim" />
      <div className="flex-grow m-8">
        <h1 className="text-5xl leading-normal">{title(exposures)}</h1>
        <h2 className="text-3xl leading-normal">{subtitle(exposures)}</h2>
        <div className="my-4">
          {userFlow.contaminant
            ? <Chart {...{ exposures, userFlow }} />
            : <ExposureSummary {...{ exposures }} />
          }
        </div>
      </div>
    </div>
  );
}

ChartPage.propTypes = {
  exposures: PropTypes.objectOf( // key: <contaminant> ("pm25")
    PropTypes.objectOf( // key: <baseId> ("VA1259")
      PropTypes.objectOf( // key: <date> ("2012-02-14")
        PropTypes.string.isRequired,
      ).isRequired,
    ).isRequired,
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
