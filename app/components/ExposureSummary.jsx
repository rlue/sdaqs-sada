import React, { useRef } from 'react';
import PropTypes from 'prop-types';

export default function ExposureSummary({ exposureHistory }) {
  return (
    <div>
      This is where I keep stuff
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
