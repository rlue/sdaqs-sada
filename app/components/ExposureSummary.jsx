import React, { useRef } from 'react';
import PropTypes from 'prop-types';

export default function ExposureSummary({ exposures, exposureStats }) {
  return (
    <div>
      {Object.entries(exposureStats).map(([contaminant, { avg, stddev }]) => {
        return (
          <div key={contaminant}>
            <h3>{contaminant}</h3>
            <dl>
              <dt>Average</dt>
              <dd>{new Number(avg).toFixed(2)} μg/m³</dd>
              <dt>Standard Deviation</dt>
              <dd>{new Number(stddev).toFixed(2)} μg/m³</dd>
            </dl>
          </div>
        )
      })}
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
