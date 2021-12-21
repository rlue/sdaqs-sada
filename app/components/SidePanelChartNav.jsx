import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Download } from './Icons';
import { exposureMap } from '../utils/chartHelper';

export default function SidePanelChartNav({
  setUserFlow,
}) {
  const [csvSpinner, setCsvSpinner] = useState(false);

  return (
    <div>
      <ul>
        <li>
          <button
            type="button"
            className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            onClick={() => setUserFlow({ mode: 'chart' })}
          >
            Summary
          </button>
        </li>
        {Object.entries(exposureMap).map(([contaminant, { name }]) =>
          <li key={contaminant}>
            <button
              type="button"
              className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
              onClick={() => setUserFlow({ mode: 'chart', contaminant })}
            >
              {name}
            </button>
          </li>
        )}
        <li>
          <button
            type="button"
            className="block w-full h-full px-5 py-3 text-left text-lg hover:bg-indigo-100"
            onClick={({ target }) => {
              const iframe = document.createElement('iframe');

              iframe.src = `/exposures.csv?${window.location.hash.split('/', 2)[1]}`;
              iframe.onload = () => {
                setCsvSpinner(false);
                target.disabled = false;
                document.body.removeChild(iframe);
              };

              setCsvSpinner(true);
              target.disabled = true;
              document.body.appendChild(iframe);
            }}
          >
            {csvSpinner
              ? <span className="spinner inline-block w-5 h-5 mr-2" />
              : <Download className="inline-block align-text-top w-5 h-5 mr-2" fill="#333" />}
            Export to CSV
          </button>
        </li>
      </ul>
    </div>
  );
}

SidePanelChartNav.propTypes = {
  setUserFlow: PropTypes.func.isRequired,
};
