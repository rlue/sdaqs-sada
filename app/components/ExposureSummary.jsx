import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { exposureMap } from '../utils/chartHelper';
import sites from '../../data/sites.json';

const reportedContaminants = Object.keys(exposureMap);

function reportedExposureStats(exposureStats) {
  return exposureStats.filter(([contaminant, values]) =>
    reportedContaminants.includes(contaminant)
  );
}

export default function ExposureSummary({ exposures, exposureStats }) {
  const exposureStatsArray = Array.from(exposureStats);
  if (exposureStatsArray.length === 2) exposureStatsArray.shift();

  return (
    <div className="exposure-summary-container">
      {exposureStatsArray.map(([baseId, stats]) =>
        <>
          <h2>{sites[baseId]?.name || 'All Bases'}</h2>
          <table className="table-auto" key={baseId}>
            <thead>
              <tr>
                <th>Contaminant</th>
                <th>Average</th>
                <th>Standard Deviation</th>
              </tr>
            </thead>
            <tbody>
              {reportedContaminants.map((contaminant) =>
                <tr key={`${baseId}-${contaminant}`}>
                  <td>{contaminant}</td>
                  <td>{new Number(exposureStats.get(baseId)[`${contaminant}_avg`]).toPrecision(3)}</td>
                  <td>{new Number(exposureStats.get(baseId)[`${contaminant}_stddev`]).toPrecision(3)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
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
  exposureStats: PropTypes.instanceOf(Map).isRequired, // key: <baseId> ("VA1259")
};
