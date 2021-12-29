import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
import ExposureSummary from './ExposureSummary';

export default function ChartPage({ exposures, exposureStats, userFlow }) {
  return (
    <div className="exposure-container flex w-screen min-h-screen overflow-x-hidden">
      <div className="exposure-shim" />
      {
        Object.keys(exposures).length
          ? <div className="grow m-8">
              <h1 className="text-5xl text-violet-900 uppercase mb-5">Summary</h1>
              {userFlow.contaminant
                ? <Chart {...{ exposures, exposureStats, userFlow }} />
                : <ExposureSummary {...{ exposures, exposureStats }} />
              }
            </div>
          : <div className="flex w-full h-screen items-center justify-center">
              <div className="spinner" />
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
