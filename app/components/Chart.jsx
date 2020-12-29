import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {Chart as ChartJS} from 'chart.js';
import 'chartjs-plugin-colorschemes';
import sites from '../../data/sites.json';

// NOTE the difference:
// this `exposures` var            -> exposures[base_id][date]
// top-level `exposures` state var -> exposures[contaminant][base_id][date]
function exposuresToChartJSDataset(exposures) {
  return {
    datasets: Object.keys(exposures)
      .map((baseId) => ({
        label: sites[baseId].name,
        data: Object.entries(exposures[baseId])
          .map(([date, concentration]) => ({
            x: date,
            y: concentration,
          })),
      })),
  };
}

export default function Chart({ exposures, userFlow }) {
  const chartCanvas = useRef();
  const chart = useRef();

  useEffect(() => {
    chart.current = new ChartJS(chartCanvas.current, {
      type: 'line',
      data: exposuresToChartJSDataset(exposures[userFlow.contaminant]),
      options: {
        elements: {
          point: {
            radius: 0,
          },
        },
        legend: {
          display: Object.keys(exposures).length > 1,
        },
        plugins: {
          colorschemes: {
            scheme: 'brewer.Spectral11',
          },
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'month',
            },
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'μg/m³',
            },
          }],
        },
        tooltips: {
          callbacks: {
            beforeBody: ([{ label }]) => label,
            label: ({ value }) => ` ${value} μg/m³`,
          },
          mode: 'nearest',
          axis: 'x',
          intersect: false,
          position: 'average',
          titleFontSize: 18,
          titleMarginBottom: 12,
          xPadding: 12,
          yPadding: 12,
        },
      },
    });
  }, []);

  useEffect(() => {
    chart.current.data = exposuresToChartJSDataset(exposures[userFlow.contaminant]);
    chart.current.update();
  }, [exposures, userFlow.contaminant]);

  return <canvas ref={chartCanvas} className="bg-white p-2 rounded-lg shadow-md" />;
}

Chart.propTypes = {
  exposures: PropTypes.objectOf( // key: <contaminant> ("pm25"),
    PropTypes.objectOf( // key: <baseId> ("VA1259")
      PropTypes.objectOf( // key: <date> ("2012-02-14")
        PropTypes.string.isRequired,
      ).isRequired,
    ).isRequired,
  ).isRequired,
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
