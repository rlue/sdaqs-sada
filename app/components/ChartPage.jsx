import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
import ExposureSummary from './ExposureSummary';
import { exposureMap } from '../utils/chartHelper';

export default function ChartPage({ exposures, exposureStats, userFlow }) {
  return (
    <div className="exposure-container flex w-screen min-h-screen overflow-x-hidden">
      <div className="exposure-shim" />
      {
        Object.keys(exposures).length === 0
          ? <div className="flex w-full h-screen items-center justify-center">
              <div className="spinner" />
            </div>
          : userFlow.contaminant === undefined
            ? <div className="grow m-8">
                <h1 className="text-6xl text-gray-800 uppercase mb-5">Summary</h1>
                <ExposureSummary {...{ exposures, exposureStats }} />
              </div>
            : exposureMap[userFlow.contaminant]?.description
              ? <div className="grow m-8">
                  <h1 className="text-6xl text-gray-800 uppercase mb-2">{exposureMap[userFlow.contaminant].name}</h1>
                  <h2 className="text-3xl text-gray-600 mb-5">{exposureMap[userFlow.contaminant].description}</h2>
                  <Chart {...{ exposures, exposureStats, userFlow }} />
                </div>
              : <div className="grow m-8">
                  <h1 className="text-6xl text-gray-800 uppercase mb-5">{exposureMap[userFlow.contaminant].name}</h1>
                  <Chart {...{ exposures, exposureStats, userFlow }} />
                </div>
      }
    </div>
  );
}

ChartPage.propTypes = {
  exposures: PropTypes.objectOf( // key: <contaminant> ("pm25")
    PropTypes.objectOf( // key: <baseId> ("VA1259")
      PropTypes.objectOf( // key: <date> ("2012-02-14")
        PropTypes.string,
      ).isRequired,
    ).isRequired,
  ).isRequired,
  exposureStats: PropTypes.instanceOf(Map).isRequired, // key: <baseId> ("VA1259")
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
