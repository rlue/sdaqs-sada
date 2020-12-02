import React from 'react';
import PropTypes from 'prop-types';
import { exposureMap } from '../utils/chartHelper';

export default function ExposureTile({ contaminant, avg, stddev }) {
  const { name, description } = exposureMap[contaminant];

  return (
    <div className={`exposure-tile relative my-7 p-2 w-full border rounded bg-gradient-to-br from-transparent to-yellow-100 border-yellow-500 text-yellow-900 shadow-md`}>
      <h3 className={`exposure-tile__title relative whitespace-nowrap text-4xl text-yellow-900`}>
        {name}
        <div className="truncate text-lg">{description}</div>
      </h3>
      <dl className="flex text-right">
        <div className="w-1/2 flex flex-col-reverse">
          <dt className="font-normal text-sm text-gray-400 uppercase">Average</dt>
          <dd className="exposure-tile__average text-2xl font-bold">{new Number(avg).toPrecision(3)}</dd>
        </div>
        <div className="w-1/2 flex flex-col-reverse">
          <dt className="font-normal text-sm text-gray-400 uppercase">Standard Deviation</dt>
          <dd className="exposure-tile__std-dev text-2xl font-bold">{new Number(stddev).toPrecision(3)}</dd>
        </div>
      </dl>
    </div>
  );
}

ExposureTile.propTypes = {
  contaminant: PropTypes.string.isRequired,
  avg: PropTypes.string.isRequired,
  stddev: PropTypes.string.isRequired,
};
