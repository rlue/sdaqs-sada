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
    <>
      {exposureStatsArray.map(([baseId, stats]) =>
        <React.Fragment key={baseId}>
          <h2 className="text-3xl text-gray-600 mt-8 mb-3">{sites[baseId]?.name || 'All Bases'}</h2>
          <table className="exposure-stats">
            <caption>All figures in μg/m³</caption>
            <thead>
              <tr>
                <td></td>
                <th>Average</th>
                <th>Standard Deviation</th>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {reportedContaminants.map((contaminant) =>
              <tr key={`${baseId}-${contaminant}`}>
                <th>{exposureMap[contaminant].name}</th>
                <td>{new Number(exposureStats.get(baseId)[`${contaminant}_avg`]).toPrecision(3)}</td>
                <td>{new Number(exposureStats.get(baseId)[`${contaminant}_stddev`]).toPrecision(3)}</td>
                <td></td>
              </tr>
              )}
            </tbody>
          </table>
        </React.Fragment>
      )}
    </>
  );
}

ExposureSummary.propTypes = {
  exposures: PropTypes.objectOf( // key: <contaminant> ("pm25")
    PropTypes.objectOf( // key: <baseId> ("VA1259")
      PropTypes.objectOf( // key: <date> ("2012-02-14")
        PropTypes.string,
      ).isRequired,
    ).isRequired,
  ).isRequired,
  exposureStats: PropTypes.instanceOf(Map).isRequired, // key: <baseId> ("VA1259")
};
