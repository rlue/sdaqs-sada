import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {Chart as ChartJS} from 'chart.js';
import 'chartjs-plugin-annotation';
import 'chartjs-plugin-colorschemes';
import sites from '../../data/sites.json';

// NOTE the difference:
// this `exposures` var            -> exposures[base_id][date]
// top-level `exposures` state var -> exposures[contaminant][base_id][date]
function exposuresToChartJSDataset(exposures, orderOfMagnitudeCorrection) {
  return {
    datasets: Object.keys(exposures)
      .map((baseId) => ({
        label: sites[baseId].name,
        data: Object.entries(exposures[baseId])
          .map(([date, concentration]) => ({
            x: date,
            y: concentration * orderOfMagnitudeCorrection,
          })),
      })),
  };
}

export default function Chart({ exposures, exposureStats, userFlow }) {
  const chartCanvas = useRef();
  const chart = useRef();
  const orderOfMagnitudeCorrection = userFlow.contaminant === 'pm25' ? 1 : 1000000000
  const avg = Number(exposureStats.get('aggregate')[`${userFlow.contaminant}_avg`]) * orderOfMagnitudeCorrection;
  const stddev = Number(exposureStats.get('aggregate')[`${userFlow.contaminant}_stddev`]) * orderOfMagnitudeCorrection;

  useEffect(() => {
    chart.current = new ChartJS(chartCanvas.current, {
      type: 'line',
      data: exposuresToChartJSDataset(exposures[userFlow.contaminant], orderOfMagnitudeCorrection),
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
        annotation: {
          annotations: [{
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-0',
            borderColor: 'rgb(100, 149, 237)',
            borderDash: [6, 6],
            borderDashOffset: 0,
            borderWidth: 3,
            label: {
              enabled: true,
              backgroundColor: 'rgb(100, 149, 237)',
              content: `Average: ${avg.toFixed(2)}`
            },
            value: avg,
          }, {
            type: 'line',
            mode: 'horizontal',
            borderColor: 'rgba(102, 102, 102, 0.5)',
            borderDash: [6, 6],
            borderDashOffset: 0,
            borderWidth: 3,
            scaleID: 'y-axis-0',
            value: avg - stddev
          }, {
            type: 'line',
            mode: 'horizontal',
            borderColor: 'rgba(102, 102, 102, 0.5)',
            borderDash: [6, 6],
            borderDashOffset: 0,
            borderWidth: 3,
            scaleID: 'y-axis-0',
            value: avg + stddev
          }],
        },
      },
    });
  }, [userFlow.contaminant]);

  useEffect(() => {
    chart.current.data = exposuresToChartJSDataset(exposures[userFlow.contaminant], orderOfMagnitudeCorrection);
    chart.current.update();
  }, [exposures, userFlow.contaminant]);

  return <canvas ref={chartCanvas} className="bg-white p-2 rounded-lg shadow-md" />;
}

Chart.propTypes = {
  exposures: PropTypes.objectOf( // key: <contaminant> ("pm25"),
    PropTypes.objectOf( // key: <baseId> ("VA1259")
      PropTypes.objectOf( // key: <date> ("2012-02-14")
        PropTypes.string,
      ).isRequired,
    ).isRequired,
  ).isRequired,
  exposureStats: PropTypes.instanceOf(Map).isRequired, // key: <baseId> ("VA1259")
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
