import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ExposureTile from './ExposureTile';
import { exposureMap } from '../utils/chartHelper';

const reportedContaminants = Object.keys(exposureMap);

function reportedExposureStats(exposureStats) {
  return exposureStats.filter(([contaminant, values]) =>
    reportedContaminants.includes(contaminant)
  );
}

export default function ExposureSummary({ exposures, exposureStats }) {
  return (
    <div className="flex flex-wrap">
      {Object.entries(exposureStats)
          .filter(([contaminant,]) => reportedContaminants.includes(contaminant))
          .map(([contaminant, { avg, stddev }]) =>
            <ExposureTile key={contaminant} {...{ contaminant, avg, stddev }} />
          )}
    </div>
  );
}

ExposureSummary.propTypes = {
  exposures: PropTypes.objectOf( // key: <contaminant> ("pm25")
    PropTypes.objectOf( // key: <baseId> ("VA1259")
      PropTypes.objectOf( // key: <date> ("2012-02-14")
        PropTypes.string.isRequired,
      ).isRequired,
    ).isRequired,
  ).isRequired,
  exposureStats: PropTypes.objectOf( // key: <contaminant> ("pm25")
    PropTypes.objectOf( // key: <type> ("avg" | "stddev")
      PropTypes.string.isRequired,
    ).isRequired,
  ).isRequired,
};
