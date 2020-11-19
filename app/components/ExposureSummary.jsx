import React, { useRef } from 'react';
import PropTypes from 'prop-types';

export default function ExposureSummary({ exposures }) {
  return (
    <div>
      This is where I keep stuff
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
};
