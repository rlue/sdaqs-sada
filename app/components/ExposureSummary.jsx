import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ExposureChart from './ExposureChart';

export default function ExposureSummary({ exposureHistory }) {
  const contaminants = useRef(['pm25']);

  return (
    <div className="exposure-container flex w-screen min-h-screen overflow-x-hidden">
      <div className="exposure-shim" />
      <div id="exposure-summary" className="m-8">
        <h1 className="text-4xl">Your Results</h1>
        {contaminants.current.map((contaminant) => (
          <ExposureChart
            key={contaminant}
            {...{ contaminant, exposureHistory }}
          />
        ))}
      </div>
    </div>
  );
}

ExposureSummary.propTypes = {
  exposureHistory: PropTypes.objectOf( // key: <baseId> (e.g., VA0518)
    PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        pm25: PropTypes.string.isRequired,
      }).isRequired,
    ),
  ).isRequired,
};
